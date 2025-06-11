import { Observable, forkJoin, from, of, throwError } from 'rxjs';
import { catchError, map, retry, switchMap, tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

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

// Interfaces

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  private readonly apiUrl = `http://${environment.apiUrl}/reports`;
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
  createReport(
    report: Omit<Report, 'id' | 'created_at' | 'updated_at'>
  ): Observable<string> {
    const id = uuidv4();
    const timestamp = new Date().toISOString();

    const reportData: Report = {
      ...report,
      id,
      created_at: timestamp,
      updated_at: timestamp,
    };

    return from(this.saveReportLocally(this.serializeReport(reportData))).pipe(
      switchMap(() => {
        // Attempt to sync to backend
        return this.syncReportToBackend(reportData).pipe(
          tap(() => this.markReportAsSynced(id)),
          catchError((error) => {
            console.warn(`Failed to sync report ${id} to backend:`, error);
            this.markReportSyncFailed(id);
            // Don't throw error - report is saved locally
            return of(id);
          })
        );
      }),
      map(() => id),
      catchError((error) => {
        console.error('Failed to create report:', error);
        return throwError(error);
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
        return throwError(error);
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
        return throwError(error);
      })
    );
  }

  /**
   * Get all reports from local storage
   */
  getAllReports(): Observable<Report[]> {
    return from(this.databaseService.db).pipe(
      switchMap((db) => {
        return from(db['reports'].find().exec());
      }),
      map((docs) => docs.map((doc) => doc.toJSON())),
      catchError((error) => {
        console.error('Failed to get all reports:', error);
        return throwError(error);
      })
    );
  }

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
        return throwError(error);
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
        return throwError(error);
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

    await Promise.all([
      await db['reports'].insert({
        id: report.id,
        rev: report._rev,
        patient_id: report.initial_details.patient_id,
        created_at: report.created_at,
        updated_at: report.updated_at,
      }),
      await db['report_axillary_node'].insert({
        id: '1',
        report_id: report.id,
        ...report.microscopy.axillary_node,
      }),
      await db['report_axillary_procedure'].insert({
        id: '1',
        report_id: report.id,
        ...report.macroscopy.axillary_procedure,
      }),
      await db['report_ihc'].insert({
        id: '1',
        report_id: report.id,
        ...report.ihc,
      }),
      await db['report_in_situ_carcinoma'].insert({
        id: '1',
        report_id: report.id,
        ...report.microscopy.in_situ_carcinoma,
      }),
      await db['report_initial_details'].insert({
        id: '1',
        report_id: report.id,
        ...report.initial_details,
      }),
      await db['report_invasive_carcinoma'].insert({
        id: '1',
        report_id: report.id,
        ...report.microscopy.invasive_carcinoma,
      }),
      await db['report_margins'].insert({
        id: '1',
        report_id: report.id,
        ...report.microscopy.margin,
      }),
      await db['report_other_margins'].insert({
        id: '1',
        report_id: report.id,
        ...report.microscopy.surgical_margins_actual,
      }),
      await db['report_pathological_staging'].insert({
        id: '1',
        report_id: report.id,
        ...report.microscopy.pathological_staging,
      }),
      await db['report_pathologist_report'].insert({
        id: '1',
        report_id: report.id,
        ...report.pathologist_report,
      }),
      await db['report_specimen_dimensions'].insert({
        id: '1',
        report_id: report.id,
        ...report.macroscopy.specimen_dimensions,
      }),
      await db['report_specimen_type'].insert({
        id: '1',
        report_id: report.id,
        ...report.macroscopy.specimen_type,
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

    if (!doc) {
      throw new Error('Report not found locally');
    }

    await doc.update({
      ...updates,
      synced: false,
      sync_status: 'pending',
      last_sync_attempt: new Date().toISOString(),
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
          data: {
            report_id: string;
          };
        }>
      >(`${this.apiUrl}`, cleanReport, this.httpOptions)
      .pipe(
        retry(1),
        map((response) => {
          if (response.success && response.data) {
            return response.data.data.report_id;
          }
          throw new Error(response.message || 'Failed to create report');
        }),
        catchError(this.handleError)
      );
  }

  private getReportFromBackend(id: string): Observable<Report> {
    return this.http.get<ApiResponse<Report>>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      map((response) => {
        if (response.success && response.data) {
          return this.transformDatesFromApi(response.data);
        }
        throw new Error(response.message || 'Report not found');
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
          throw new Error(response.message || 'Failed to update report');
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
        throw new Error(response.message || 'Failed to delete report');
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
    return throwError(error);
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
