import { Observable, forkJoin, from, of, throwError } from 'rxjs';
import { catchError, map, retry, switchMap, tap } from 'rxjs/operators';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';
import { DatabaseService } from '../../rxdb/rxdb.service';
import {
  IHC,
  InitialDetails,
  Macroscopy,
  Microscopy,
  PathologistReport,
  Report,
  SurgicalMargins,
} from '../models/report.model';

interface ApiResponse<T> {
  success: boolean;
  data: {
    data: T;
  };
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  private readonly apiUrl = `${environment.apiUrl}/reports`;
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }),
  };

  constructor(
    private http: HttpClient,
    private databaseService: DatabaseService
  ) {}

  /**
   * Create a new report - save locally first, then sync to backend
   */
  createReport(report: Report): Observable<string> {
    return from(this.saveReportLocally(this.serializeReport(report))).pipe(
      switchMap(() => {
        // Attempt to sync to backend
        return this.syncReportToBackend(report).pipe(
          tap(() => this.markReportAsSynced(report.id)),
          catchError((error) => {
            console.warn(
              `Failed to sync report ${report.id} to backend:`,
              error
            );
            this.markReportSyncFailed(report.id);
            // Don't throw error - report is saved locally
            return of(report.id);
          })
        );
      }),
      map(() => report.id),
      catchError((error) => {
        console.error('Failed to create report:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get a report by ID - check local first, then backend
   */
  getReport(id: string): Observable<Report> {
    return from(this.getReportFromLocal(id)).pipe(
      switchMap((localReport) => {
        if (localReport) {
          return of(localReport);
        }
        // If not found locally, try backend
        return this.getReportFromBackend(id).pipe(
          tap((backendReport) => {
            // Save to local for future use
            this.saveReportLocally(backendReport, true);
          })
        );
        // return this.getReportFromBackend(id).pipe(
        //   switchMap((backendReport) => {
        //     if (!backendReport) {
        //       // You may want to handle this more gracefully
        //       throw new Error("Backend report not found");
        //     }

        //     // Save report locally and return the backendReport
        //     return from(this.saveReportLocally(backendReport, true)).pipe(
        //       map(() => backendReport)
        //     );
        //   })
        // );
      })
    );
  }

  /**
   * Update an existing report
   */
  updateReport(id: string, report: Partial<Report>): Observable<boolean> {
    const updateData = {
      ...report,
      updated_at: new Date().toISOString(),
    };

    return from(this.updateReportLocally(id, updateData)).pipe(
      switchMap(() => {
        // Attempt to sync to backend
        return this.updateReportOnBackend(id, updateData).pipe(
          tap(() => this.markReportAsSynced(id)),
          catchError((error) => {
            console.warn(
              `Failed to sync updated report ${id} to backend:`,
              error
            );
            this.markReportSyncFailed(id);
            // Don't throw error - report is updated locally
            return of(true);
          })
        );
      }),
      map(() => true),
      catchError((error) => {
        console.error('Failed to update report:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete a report
   */
  deleteReport(id: string): Observable<boolean> {
    return forkJoin([
      from(this.deleteReportLocally(id)),
      this.deleteReportFromBackend(id).pipe(
        catchError((error) => {
          console.warn(`Failed to delete report ${id} from backend:`, error);
          return of(true); // Continue even if backend delete fails
        })
      ),
    ]).pipe(
      map(() => true),
      catchError((error) => {
        console.error('Failed to delete report:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get all reports from local storage
   */
  getAllReports(): Observable<Report[]> {
    return from(this.databaseService.db).pipe(
      switchMap((db) =>
        // Fetch both reports and initial details from local DB
        forkJoin({
          reports: from(db['reports'].find().exec()).pipe(
            map((docs) => docs.map((doc) => doc.toJSON()))
          ),
          initialDetails: from(db['report_initial_details'].find().exec()).pipe(
            map((docs) => docs.map((doc) => doc.toJSON()))
          )
        }).pipe(
          map(({ reports, initialDetails }) => {
            // Create a map of initial details by report_id for quick lookup
            const initialDetailsMap = new Map(
              initialDetails.map((detail) => [detail.report_id, detail])
            );
  
            // Merge reports with their initial details
            const localReportsWithDetails = reports.map((report) => ({
              ...report,
              initial_details: initialDetailsMap.get(report.id) || null
            }));
            console.log('Local reports with details:', localReportsWithDetails);
            return localReportsWithDetails;
          }),
          switchMap((localReports) =>
            this.http.get<ApiResponse<Report[]>>(this.apiUrl).pipe(
              map((remoteReports) => {
                const mergedReports: Report[] = [];
  
                // Create a Map of remote reports for quick access
                const remoteMap = new Map(
                  remoteReports.data.data.map((r) => [r.id, r])
                );
  
                const localIds = new Set(localReports.map((r) => r.id));
  
                // Merge or resolve conflicts
                localReports.forEach((local) => {
                  const remote = remoteMap.get(local.id);
                  if (!remote) {
                    // unsynced local report
                    mergedReports.push(local);
                  } else {
                    // Resolve conflict by updated_at
                    const localDate = new Date(local.updated_at).getTime();
                    const remoteDate = new Date(remote.updated_at).getTime();
                    mergedReports.push(
                      localDate >= remoteDate ? local : remote
                    );
  
                    // Remove from map to avoid re-processing
                    remoteMap.delete(local.id);
                  }
                });
  
                // Add remaining remote reports (not in local)
                for (const remaining of remoteMap.values()) {
                  mergedReports.push(remaining);
                }
                console.log('Merged reports:', mergedReports);
                return mergedReports;
              }),
              catchError((error) => {
                console.warn(
                  `Backend fetch failed. Showing local reports only`
                );
                console.error({ error });
                return of(localReports); // fallback to local with initial details
              })
            )
          )
        )
      ),
      catchError((error) => {
        console.error('Failed to get all reports from local DB:', error);
        return throwError(() => error);
      })
    );
  }

  // getAllReports(): Observable<Report[]> {
  //   return from(this.databaseService.db).pipe(
  //     switchMap((db) =>
  //       from(db['reports'].find().exec()).pipe(
  //         map((docs) => docs.map((doc) => doc.toJSON())),
  //         switchMap((localReports) =>
  //           this.http.get<ApiResponse<Report[]>>(this.apiUrl).pipe(
  //             map((remoteReports) => {
  //               const mergedReports: Report[] = [];

  //               // Create a Map of remote reports for quick access
  //               const remoteMap = new Map(
  //                 remoteReports.data.data.map((r) => [r.id, r])
  //               );

  //               const localIds = new Set(localReports.map((r) => r.id));

  //               // Merge or resolve conflicts
  //               localReports.forEach((local) => {
  //                 const remote = remoteMap.get(local.id);
  //                 if (!remote) {
  //                   // unsynced local report
  //                   mergedReports.push(local);
  //                 } else {
  //                   // Resolve conflict by updated_at
  //                   const localDate = new Date(local.updated_at).getTime();
  //                   const remoteDate = new Date(remote.updated_at).getTime();
  //                   mergedReports.push(
  //                     localDate >= remoteDate ? local : remote
  //                   );

  //                   // Remove from map to avoid re-processing
  //                   remoteMap.delete(local.id);
  //                 }
  //               });

  //               // Add remaining remote reports (not in local)
  //               for (const remaining of remoteMap.values()) {
  //                 mergedReports.push(remaining);
  //               }

  //               return mergedReports;
  //             }),
  //             catchError((error) => {
  //               console.warn(
  //                 `Backend fetch failed. Showing local reports only`
  //               );
  //               console.error({ error });
  //               return of(localReports); // fallback to local
  //             })
  //           )
  //         )
  //       )
  //     ),
  //     catchError((error) => {
  //       console.error('Failed to get all reports from local DB:', error);
  //       return throwError(() => error);
  //     })
  //   );
  // }

  /**
   * Get all unsynced reports
   */
  getUnsyncedReports(): Observable<Report[]> {
    return from(this.databaseService.db).pipe(
      switchMap((db) => {
        return from(
          db['reports']
            .find({
              selector: {
                $or: [
                  { synced: { $exists: false } },
                  { synced: false },
                  { sync_status: 'failed' },
                ],
              },
            })
            .exec()
        );
      }),
      map((docs) => docs.map((doc) => doc.toJSON())),
      catchError((error) => {
        console.error('Failed to get unsynced reports:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Sync all pending reports to backend
   */
  syncAllPendingReports(): Observable<{ success: number; failed: number }> {
    return this.getUnsyncedReports().pipe(
      switchMap((reports) => {
        if (reports.length === 0) {
          return of({ success: 0, failed: 0 });
        }

        const syncOperations = reports.map((report) =>
          this.syncReportToBackend(report).pipe(
            tap(() => this.markReportAsSynced(report.id)),
            map(() => ({ success: true, id: report.id })),
            catchError((error) => {
              console.error(`Failed to sync report ${report.id}:`, error);
              this.markReportSyncFailed(report.id);
              return of({ success: false, id: report.id });
            })
          )
        );

        return forkJoin(syncOperations).pipe(
          map((results) => {
            const success = results.filter((r) => r.success).length;
            const failed = results.filter((r) => !r.success).length;
            return { success, failed };
          })
        );
      }),
      catchError((error) => {
        console.error('Failed to sync pending reports:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Private helper methods
   */
  private async saveReportLocally(
    report: Report,
    synced: boolean = false
  ): Promise<void> {
    const db = await this.databaseService.db;
    const reportWithSync = {
      ...report,
      synced,
      sync_status: synced ? 'synced' : ('pending' as const),
    };

    const dates = {
      created_at: report.created_at,
      updated_at: report.updated_at,
    };

    await Promise.all([
      await db['reports'].upsert({
        id: report.id,
        rev: report._rev,
        patient_id: report.initial_details.patient_id,
        ...dates,
      }),
      await db['report_axillary_node'].upsert({
        id: '1',
        report_id: report.id,
        ...report.microscopy.axillary_node,
        ...dates,
      }),
      await db['report_axillary_procedure'].upsert({
        id: '1',
        report_id: report.id,
        ...report.macroscopy.axillary_procedure,
        ...dates,
      }),
      await db['report_ihc'].upsert({
        id: '1',
        report_id: report.id,
        ...report.ihc,
        ...dates,
      }),
      await db['report_in_situ_carcinoma'].upsert({
        id: '1',
        report_id: report.id,
        ...report.microscopy.in_situ_carcinoma,
        ...dates,
      }),
      await db['report_initial_details'].upsert({
        id: '1',
        report_id: report.id,
        ...report.initial_details,
        ...dates,
      }),
      await db['report_invasive_carcinoma'].upsert({
        id: '1',
        report_id: report.id,
        ...report.microscopy.invasive_carcinoma,
        ...dates,
      }),
      await db['report_margins'].upsert({
        id: '1',
        report_id: report.id,
        ...report.microscopy.margin,
        ...dates,
      }),
      await db['report_other_margins'].upsert({
        id: '1',
        report_id: report.id,
        ...report.microscopy.surgical_margins_actual,
        ...dates,
      }),
      await db['report_pathological_staging'].upsert({
        id: '1',
        report_id: report.id,
        ...report.microscopy.pathological_staging,
        ...dates,
      }),
      await db['report_pathologist_report'].upsert({
        id: '1',
        report_id: report.id,
        ...report.pathologist_report,
        ...dates,
      }),
      await db['report_specimen_dimensions'].upsert({
        id: '1',
        report_id: report.id,
        ...report.macroscopy.specimen_dimensions,
        ...dates,
      }),
      await db['report_specimen_type'].upsert({
        id: '1',
        report_id: report.id,
        ...report.macroscopy.specimen_type,
        ...dates,
      }),
    ]);
  }

  private async getReportFromLocal(id: string): Promise<Report | null> {
    try {
      const db = await this.databaseService.db;
      const doc = await db['reports'].findOne(id).exec();
      return doc ? doc.toJSON() : null;
    } catch (error) {
      console.error('Error getting report from local:', error);
      return null;
    }
  }

  private async updateReportLocally(
    id: string,
    updates: Partial<Report>
  ): Promise<void> {
    const db = await this.databaseService.db;
    const doc = await db['reports'].findOne(id).exec();
    const timestamp = new Date().toISOString();

    if (!doc) {
      throw new Error('Report not found locally');
    }

    await doc.update({
      ...updates,
      synced: false,
      sync_status: 'pending',
      last_sync_attempt: new Date().toISOString(),
      updated_at: timestamp,
    });
  }

  private async deleteReportLocally(id: string): Promise<void> {
    const db = await this.databaseService.db;
    const doc = await db['reports'].findOne(id).exec();

    if (doc) {
      await doc.remove();
    }
  }

  private async markReportAsSynced(id: string): Promise<void> {
    try {
      const db = await this.databaseService.db;
      const doc = await db['reports'].findOne(id).exec();

      if (doc) {
        await doc.update({
          synced: true,
          sync_status: 'synced',
        });
      }
    } catch (error) {
      console.error('Error marking report as synced:', error);
    }
  }

  private async markReportSyncFailed(id: string): Promise<void> {
    try {
      const db = await this.databaseService.db;
      const doc = await db['reports'].findOne(id).exec();

      if (doc) {
        await doc.update({
          sync_status: 'failed',
          last_sync_attempt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error marking report sync as failed:', error);
    }
  }

  // Backend API methods (your existing methods with slight modifications)
  private syncReportToBackend(report: Report): Observable<string> {
    const cleanReport = this.cleanReportData(report);
    return this.http
      .post<
        ApiResponse<{
          message: string;
          status: string;
          report_id: string;
        }>
      >(`${this.apiUrl}`, cleanReport, this.httpOptions)
      .pipe(
        retry(1),
        map((response) => {
          if (response.success && response.data) {
            return response.data.data.report_id;
          }
          throw new Error(response?.error || 'Failed to create report');
        }),
        catchError(this.handleError)
      );
  }

  getReportFromBackend(id: string): Observable<Report> {
    return this.http.get<ApiResponse<Report>>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      map((response) => {
        if (response.success && response.data) {
          // return this.transformDatesFromApi(response.data.data);
          // console.log('Report from backend:', response.data);
          return response.data.data;
        }
        throw new Error(response?.error || 'Report not found');
      }),
      catchError(this.handleError)
    );
  }

  private updateReportOnBackend(
    id: string,
    report: Partial<Report>
  ): Observable<boolean> {
    const updateData = { ...report };
    return this.http
      .put<ApiResponse<any>>(
        `${this.apiUrl}/${id}`,
        updateData,
        this.httpOptions
      )
      .pipe(
        retry(1),
        map((response) => {
          if (response.success) {
            return true;
          }
          throw new Error(response?.error || 'Failed to update report');
        }),
        catchError(this.handleError)
      );
  }

  private deleteReportFromBackend(id: string): Observable<boolean> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      map((response) => {
        if (response.success) {
          return true;
        }
        throw new Error(response?.error || 'Failed to delete report');
      }),
      catchError(this.handleError)
    );
  }

  private cleanReportData(
    report: Report
  ): Omit<Report, 'created_at' | 'updated_at'> {
    const {
      created_at,
      updated_at,
      synced,
      sync_status,
      last_sync_attempt,
      ...cleanData
    } = report as any;
    return cleanData;
  }

  private transformDatesFromApi(report: Report): Report {
    // Add any date transformation logic here
    return report;
  }

  private handleError = (error: any): Observable<never> => {
    console.error('API Error:', error);
    return throwError(() => error);
  };

  private coerceBoolean(value: any): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.trim() !== '';
    return Boolean(value);
  }

  private serializeReport(report: Partial<Report>): Report {
    return {
      id: report.id || '',
      _rev: report._rev || undefined,
      initial_details: this.serializeInitialDetails(report.initial_details),
      macroscopy: this.serializeMacroscopy(report.macroscopy),
      microscopy: this.serializeMicroscopy(report.microscopy),
      ihc: report.ihc || ({} as IHC),
      pathologist_report:
        report.pathologist_report || ({} as PathologistReport),
      created_at: report.created_at || new Date().toISOString(),
      updated_at: report.updated_at || new Date().toISOString(),
    };
  }

  private serializeInitialDetails(
    details?: Partial<InitialDetails>
  ): InitialDetails {
    return {
      patient_id: details?.patient_id || undefined,
      hospital_number: details?.hospital_number || undefined,
      histology_number: details?.histology_number || '',
      referring_hospital: details?.referring_hospital || undefined,
      referring_clinician: details?.referring_clinician || undefined,
      reporting_date: details?.reporting_date || undefined,
      side: details?.side || undefined,
    };
  }

  private serializeMacroscopy(macroscopy?: Partial<Macroscopy>): Macroscopy {
    return {
      specimen_type: {
        core_needle_biopsy: this.coerceBoolean(
          macroscopy?.specimen_type?.core_needle_biopsy
        ),
        wide_local_excision: this.coerceBoolean(
          macroscopy?.specimen_type?.wide_local_excision
        ),
        mastectomy: this.coerceBoolean(macroscopy?.specimen_type?.mastectomy),
        open_biopsy: this.coerceBoolean(macroscopy?.specimen_type?.open_biopsy),
        segmental_excision: this.coerceBoolean(
          macroscopy?.specimen_type?.segmental_excision
        ),
        wide_bore_needle_biopsy: this.coerceBoolean(
          macroscopy?.specimen_type?.wide_bore_needle_biopsy
        ),
      },
      specimen_dimensions: {
        weight: macroscopy?.specimen_dimensions?.weight || 0,
        length: macroscopy?.specimen_dimensions?.length || 0,
        width: macroscopy?.specimen_dimensions?.width || 0,
        height: macroscopy?.specimen_dimensions?.height || 0,
      },
      axillary_procedure: {
        no_lymph_node_procedure: this.coerceBoolean(
          macroscopy?.axillary_procedure?.no_lymph_node_procedure
        ),
        axillary_node_sample: this.coerceBoolean(
          macroscopy?.axillary_procedure?.axillary_node_sample
        ),
        sentinel_node_biopsy: this.coerceBoolean(
          macroscopy?.axillary_procedure?.sentinel_node_biopsy
        ),
        axillary_node_clearance: this.coerceBoolean(
          macroscopy?.axillary_procedure?.axillary_node_clearance
        ),
        intrammary_node: this.coerceBoolean(
          macroscopy?.axillary_procedure?.intrammary_node
        ),
      },
    };
  }

  private serializeMicroscopy(microscopy?: Partial<Microscopy>): Microscopy {
    return {
      in_situ_carcinoma: {
        ductal_carcinoma_in_situ:
          microscopy?.in_situ_carcinoma?.ductal_carcinoma_in_situ || 0,
        lobular_carcinoma_in_situ: this.coerceBoolean(
          microscopy?.in_situ_carcinoma?.lobular_carcinoma_in_situ
        ),
        paget_disease: this.coerceBoolean(
          microscopy?.in_situ_carcinoma?.paget_disease
        ),
        microinvasion: this.coerceBoolean(
          microscopy?.in_situ_carcinoma?.microinvasion
        ),
      },
      invasive_carcinoma: {
        ic_present: this.coerceBoolean(
          microscopy?.invasive_carcinoma?.ic_present
        ),
        invasive_tumor_size:
          microscopy?.invasive_carcinoma?.invasive_tumor_size || undefined,
        whole_tumor_size:
          microscopy?.invasive_carcinoma?.whole_tumor_size || undefined,
        ic_type: microscopy?.invasive_carcinoma?.ic_type || undefined,
        invasive_grade:
          microscopy?.invasive_carcinoma?.invasive_grade || undefined,
        sbr_score: microscopy?.invasive_carcinoma?.sbr_score || undefined,
        tumour_extent:
          microscopy?.invasive_carcinoma?.tumour_extent || undefined,
        lympho_vascular_invasion:
          microscopy?.invasive_carcinoma?.lympho_vascular_invasion || undefined,
        site_of_other_nodes:
          microscopy?.invasive_carcinoma?.site_of_other_nodes || undefined,
      },
      axillary_node: {
        an_present: this.coerceBoolean(microscopy?.axillary_node?.an_present),
        total_number: microscopy?.axillary_node?.total_number || undefined,
        number_positive:
          microscopy?.axillary_node?.number_positive || undefined,
      },
      margin: {
        excision_margins: microscopy?.margin?.excision_margins || '',
        skin_involvement: microscopy?.margin?.skin_involvement || undefined,
        nipple_involvement: this.coerceBoolean(
          microscopy?.margin?.nipple_involvement
        ),
        skeletal_muscle_involvement:
          microscopy?.margin?.skeletal_muscle_involvement || undefined,
        surgical_margins:
          microscopy?.margin?.surgical_margins || SurgicalMargins.NEGATIVE,
      },
      surgical_margins_actual: {
        superior: this.coerceBoolean(
          microscopy?.surgical_margins_actual?.superior
        ),
        inferior: this.coerceBoolean(
          microscopy?.surgical_margins_actual?.inferior
        ),
        anterior: this.coerceBoolean(
          microscopy?.surgical_margins_actual?.anterior
        ),
        posterior: this.coerceBoolean(
          microscopy?.surgical_margins_actual?.posterior
        ),
        lateral: this.coerceBoolean(
          microscopy?.surgical_margins_actual?.lateral
        ),
        medial: this.coerceBoolean(microscopy?.surgical_margins_actual?.medial),
      },
      pathological_staging: {
        not_applicable: this.coerceBoolean(
          microscopy?.pathological_staging?.not_applicable
        ),
        pt: microscopy?.pathological_staging?.pt || 0,
        n: microscopy?.pathological_staging?.n || 0,
        m: microscopy?.pathological_staging?.m || 0,
      },
    };
  }
}
