
// src/app/core/services/report.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, forkJoin, from, map, Observable, switchMap, throwError } from 'rxjs';
import { IHC, InitialDetails, InvasiveCarcinomaTypes, Macroscopy, Microscopy, PathologistReport, Report } from '../models/report.model';
import { environment } from '../../../environments/environment';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  createReport(report: Report): Observable<Report> {
    // First, create the main report record
    return from(this.supabase
      .from('reports')
      .insert({
        // patient_id: report.patient_id,
        // rev: report.rev || '1'
        patient_id: 23
      })
      .select('id')
    ).pipe(
      switchMap(result => {
        if (result.error) {
          throw result.error;
        }
        
        const reportId = result.data[0].id;
        
        // Now create all the related records with the new report ID
        return this.saveReportComponents(reportId, report);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Save all report components to their respective tables
   * @param reportId The report ID to associate with components
   * @param report The report data
   */
  private saveReportComponents(reportId: string, report: Report): Observable<Report> {
    // Create observables for inserting each component
    const initialDetailsObs = from(this.supabase
      .from('initial_details')
      .insert({
        report_id: reportId,
        hospital_number: report.initial_details.hospital_number,
        histology_number: report.initial_details.histology_number,
        referring_hospital: report.initial_details.referring_hospital,
        referring_clinician: report.initial_details.referring_clinician,
        reporting_date: report.initial_details.reporting_date,
        side: report.initial_details.side,
        date_typed: report.initial_details.date_typed,
        typed_by: report.initial_details.typed_by
      })
    );
    
    // Specimen type
    const specimenTypeObs = from(this.supabase
      .from('specimen_types')
      .insert({
        report_id: reportId,
        core_needle_biopsy: report.macroscopy.specimen_type.core_needle_biopsy,
        wide_local_excision: report.macroscopy.specimen_type.wide_local_excision,
        mastectomy: report.macroscopy.specimen_type.mastectomy,
        open_biopsy: report.macroscopy.specimen_type.open_biopsy,
        segmental_excision: report.macroscopy.specimen_type.segmental_excision,
        wide_bore_needle_biopsy: report.macroscopy.specimen_type.wide_bore_needle_biopsy
      })
    );
    
    // Specimen dimensions
    const specimenDimensionsObs = from(this.supabase
      .from('specimen_dimensions')
      .insert({
        report_id: reportId,
        weight: report.macroscopy.specimen_dimensions.weight,
        length: report.macroscopy.specimen_dimensions.length,
        width: report.macroscopy.specimen_dimensions.width,
        height: report.macroscopy.specimen_dimensions.height
      })
    );
    
    // Axillary procedure
    const axillaryProcedureObs = from(this.supabase
      .from('axillary_procedures')
      .insert({
        report_id: reportId,
        no_lymph_node_procedure: report.macroscopy.axillary_procedure.no_lymph_node_procedure,
        axillary_node_sample: report.macroscopy.axillary_procedure.axillary_node_sample,
        sentinel_node_biopsy: report.macroscopy.axillary_procedure.sentinel_node_biopsy,
        axillary_node_clearance: report.macroscopy.axillary_procedure.axillary_node_clearance,
        intrammary_node: report.macroscopy.axillary_procedure.intrammary_node
      })
    );
    
    // In situ carcinoma
    const inSituCarcinomaObs = from(this.supabase
      .from('in_situ_carcinomas')
      .insert({
        report_id: reportId,
        ductal_carcinoma_in_situ: report.microscopy.in_situ_carcinoma.ductal_carcinoma_in_situ,
        lobular_carcinoma_in_situ: report.microscopy.in_situ_carcinoma.lobular_carcinoma_in_situ,
        paget_disease: report.microscopy.in_situ_carcinoma.paget_disease,
        microinvasion: report.microscopy.in_situ_carcinoma.microinvasion
      })
    );
    
    // Invasive carcinoma
    const invasiveCarcinomaObs = from(this.supabase
      .from('invasive_carcinomas')
      .insert({
        report_id: reportId,
        ic_present: report.microscopy.invasive_carcinoma.ic_present,
        invasive_tumor_size: report.microscopy.invasive_carcinoma.invasive_tumor_size,
        whole_tumor_size: report.microscopy.invasive_carcinoma.whole_tumor_size,
        ic_type: report.microscopy.invasive_carcinoma.ic_type,
        invasive_grade: report.microscopy.invasive_carcinoma.invasive_grade,
        sbr_score: report.microscopy.invasive_carcinoma.sbr_score,
        tumour_extent: report.microscopy.invasive_carcinoma.tumour_extent,
        lympho_vascular_invasion: report.microscopy.invasive_carcinoma.lympho_vascular_invasion,
        site_of_other_nodes: report.microscopy.invasive_carcinoma.site_of_other_nodes
      })
    );
    
    // Axillary node
    const axillaryNodeObs = from(this.supabase
      .from('axillary_nodes')
      .insert({
        report_id: reportId,
        an_present: report.microscopy.axillary_node.an_present,
        total_number: report.microscopy.axillary_node.total_number,
        number_positive: report.microscopy.axillary_node.number_positive
      })
    );
    
    // Margin
    const marginObs = from(this.supabase
      .from('margins')
      .insert({
        report_id: reportId,
        excision_margins: report.microscopy.margin.excision_margins,
        skin_involvement: report.microscopy.margin.skin_involvement,
        nipple_involvement: report.microscopy.margin.nipple_involvement,
        skeletal_muscle_involvement: report.microscopy.margin.skeletal_muscle_involvement,
        surgical_margins: report.microscopy.margin.surgical_margins
      })
    );
    
    // Other margins
    const surgicalMarginsActualObs = from(this.supabase
      .from('surgical_margins_actual')
      .insert({
        report_id: reportId,
        superior: report.microscopy.surgical_margins_actual.superior,
        inferior: report.microscopy.surgical_margins_actual.inferior,
        anterior: report.microscopy.surgical_margins_actual.anterior,
        posterior: report.microscopy.surgical_margins_actual.posterior,
        lateral_: report.microscopy.surgical_margins_actual.lateral_,
        medial: report.microscopy.surgical_margins_actual.medial
      })
    );
    
    // Pathological staging
    const pathologicalStagingObs = from(this.supabase
      .from('pathological_stagings')
      .insert({
        report_id: reportId,
        not_applicable: report.microscopy.pathological_staging.not_applicable,
        pt: report.microscopy.pathological_staging.pt,
        n: report.microscopy.pathological_staging.n,
        m: report.microscopy.pathological_staging.m
      })
    );
    
    // IHC
    const ihcObs = from(this.supabase
      .from('ihcs')
      .insert({
        report_id: reportId,
        oestrogen_receptor_status: report.ihc.oestrogen_receptor_status,
        pr: report.ihc.pr,
        her2: report.ihc.her2,
        quick_allred_score: report.ihc.quick_allred_score
      })
    );
    
    // Pathologist report
    const pathologistReportObs = from(this.supabase
      .from('pathologist_reports')
      .insert({
        report_id: reportId,
        final_diagnosis: report.pathologist_report.final_diagnosis,
        comment: report.pathologist_report.comment,
        consultant_pathologist: report.pathologist_report.consultant_pathologist,
        date_of_request: report.pathologist_report.date_of_request,
        date_received: report.pathologist_report.date_received,
        date_reviewed: report.pathologist_report.date_reviewed
      })
    );
    
    // Execute all the insertions in parallel
    return forkJoin([
      initialDetailsObs,
      specimenTypeObs,
      specimenDimensionsObs,
      axillaryProcedureObs,
      inSituCarcinomaObs,
      invasiveCarcinomaObs,
      axillaryNodeObs,
      marginObs,
      surgicalMarginsActualObs,
      pathologicalStagingObs,
      ihcObs,
      pathologistReportObs
    ]).pipe(
      switchMap(() => {
        // After all insertions complete, fetch the full report
        return this.getReportById(reportId);
      })
    );
  }

  /**
   * Get a specific report by ID with all related data
   * @param id Report ID
   * @returns Observable with report data
   */
  getReportById(id: string): Observable<Report> {
    // Fetch the main report data
    return from(this.supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single()
    ).pipe(
      switchMap(result => {
        if (result.error) {
          return throwError(() => new Error(result.error.message));
        }
  
        const report: Partial<Report> = {
          id: result.data.id,
          _rev: result.data.rev,
          // patient_id: result.data.initial_details.patient_id
        };
  
        // Ensure related data methods exist and return observables
        const relatedDataObservables = [
          this.getInitialDetails(id),
          this.getMacroscopyData(id),
          this.getMicroscopyData(id),
          this.getIhcData(id),
          this.getPathologistReport(id)
        ];
  
        // Combine all related data observables
        return forkJoin(relatedDataObservables).pipe(
          map(([initialDetails, macroscopy, microscopy, ihc, pathologistReport]) => {
            return {
              ...report,
              initial_details: initialDetails,
              macroscopy: macroscopy,
              microscopy: microscopy,
              ihc: ihc,
              pathologist_report: pathologistReport
            } as Report;
          })
        );
      }),
      catchError(this.handleError)
    );
  }

  private getInitialDetails(reportId: string): Observable<InitialDetails> {
    return from(this.supabase
      .from('initial_details')
      .select('*')
      .eq('report_id', reportId)
      .single()
    ).pipe(
      map(result => {
        if (result.error) {
          throw result.error;
        }
        return result.data as InitialDetails;
      })
    );
  }
  
  private getMacroscopyData(reportId: string): Observable<Macroscopy> {
    // Need to fetch from three tables
    return forkJoin({
      specimen_type: from(this.supabase
        .from('specimen_types')
        .select('*')
        .eq('report_id', reportId)
        .single()
      ).pipe(map(result => result.data)),
      
      specimen_dimensions: from(this.supabase
        .from('specimen_dimensions')
        .select('*')
        .eq('report_id', reportId)
        .single()
      ).pipe(map(result => result.data)),
      
      axillary_procedure: from(this.supabase
        .from('axillary_procedures')
        .select('*')
        .eq('report_id', reportId)
        .single()
      ).pipe(map(result => result.data))
    }).pipe(
      map(result => {
        // Remove report_id from each object
        delete result.specimen_type.report_id;
        delete result.specimen_dimensions.report_id;
        delete result.axillary_procedure.report_id;
        
        return result as Macroscopy;
      })
    );
  }
  
  private getMicroscopyData(reportId: string): Observable<Microscopy> {
    return forkJoin({
      in_situ_carcinoma: from(this.supabase
        .from('in_situ_carcinomas')
        .select('*')
        .eq('report_id', reportId)
        .single()
      ).pipe(map(result => {
        delete result.data.report_id;
        return result.data;
      })),
      
      invasive_carcinoma: from(this.supabase
        .from('invasive_carcinomas')
        .select('*')
        .eq('report_id', reportId)
        .single()
      ).pipe(map(result => {
        delete result.data.report_id;
        
        
        return result.data;
      })),
      
      axillary_node: from(this.supabase
        .from('axillary_nodes')
        .select('*')
        .eq('report_id', reportId)
        .single()
      ).pipe(map(result => {
        delete result.data.report_id;
        return result.data;
      })),
      
      margin: from(this.supabase
        .from('margins')
        .select('*')
        .eq('report_id', reportId)
        .single()
      ).pipe(map(result => {
        delete result.data.report_id;
        return result.data;
      })),
      
      surgical_margins_actual: from(this.supabase
        .from('surgical_margins_actual')
        .select('*')
        .eq('report_id', reportId)
        .single()
      ).pipe(map(result => {
        delete result.data.report_id;
        return result.data;
      })),
      
      pathological_staging: from(this.supabase
        .from('pathological_stagings')
        .select('*')
        .eq('report_id', reportId)
        .single()
      ).pipe(map(result => {
        delete result.data.report_id;
        return result.data;
      }))
    }).pipe(
      map(result => result as Microscopy)
    );
  }
  
  private getIhcData(reportId: string): Observable<IHC> {
    return from(this.supabase
      .from('ihcs')
      .select('*')
      .eq('report_id', reportId)
      .single()
    ).pipe(
      map(result => {
        if (result.error) {
          throw result.error;
        }
        delete result.data.report_id;
        return result.data as IHC;
      })
    );
  }
  
  private getPathologistReport(reportId: string): Observable<PathologistReport> {
    return from(this.supabase
      .from('pathologist_reports')
      .select('*')
      .eq('report_id', reportId)
      .single()
    ).pipe(
      map(result => {
        if (result.error) {
          throw result.error;
        }
        delete result.data.report_id;
        return result.data as PathologistReport;
      })
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}