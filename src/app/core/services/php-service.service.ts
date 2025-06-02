import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, retry } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/shared.module';
import { Report } from '../models/report.model';

@Injectable({
  providedIn: 'root'
})
export class PhpServiceService {
  private readonly apiUrl = `http://${environment.apiUrl}/reports`;
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  /**
   * Create a new report
   */
  createReport(report: Omit<Report, 'id' | 'created_at' | 'updated_at'>): Observable<string> {
    report = this.cleanReportData(report);
    return this.http.post<ApiResponse<{ id: string }>>(`${this.apiUrl}`, report, this.httpOptions)
      .pipe(
        retry(1),
        map(response => {
          if (response.success && response.data) {
            return response.data.id;
          }
          throw new Error(response.message || 'Failed to create report');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Get a report by ID
   */
  getReport(id: string): Observable<Report> {
    return this.http.get<ApiResponse<Report>>(`${this.apiUrl}/${id}`)
      .pipe(
        retry(1),
        map(response => {
          if (response.success && response.data) {
            return this.transformDatesFromApi(response.data);
          }
          throw new Error(response.message || 'Report not found');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Update an existing report
   */
  updateReport(id: string, report: Partial<Report>): Observable<boolean> {
    const updateData = { ...report };
    // delete updateData.id;

    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${id}`, updateData, this.httpOptions)
      .pipe(
        retry(1),
        map(response => {
          if (response.success) {
            return true;
          }
          throw new Error(response.message || 'Failed to update report');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Delete a report
   */
  deleteReport(id: string): Observable<boolean> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`)
      .pipe(
        retry(1),
        map(response => {
          if (response.success) {
            return true;
          }
          throw new Error(response.message || 'Failed to delete report');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Get all reports for a patient
   */
  getReportsByPatient(patientId: string): Observable<Report[]> {
    return this.http.get<ApiResponse<Report[]>>(`${this.apiUrl}/patient/${patientId}`)
      .pipe(
        retry(1),
        map(response => {
          if (response.success && response.data) {
            return response.data.map(report => this.transformDatesFromApi(report));
          }
          return [];
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Search reports with filters
   */
  searchReports(filters: {
    patientId?: string;
    histologyNumber?: string;
    consultantPathologist?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
  }): Observable<{ reports: Report[], total: number }> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    return this.http.get<ApiResponse<{ reports: Report[], total: number }>>(
      `${this.apiUrl}/search?${params.toString()}`
    ).pipe(
      retry(1),
      map(response => {
        if (response.success && response.data) {
          return {
            reports: response.data.reports.map(report => this.transformDatesFromApi(report)),
            total: response.data.total
          };
        }
        return { reports: [], total: 0 };
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Validate report data before submission
   */
  validateReport(report: Partial<Report>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields validation
    if (!report.initial_details?.patient_id) {
      errors.push('Patient ID is required');
    }

    if (!report.initial_details?.histology_number) {
      errors.push('Histology number is required');
    }

    if (!report.pathologist_report?.final_diagnosis) {
      errors.push('Final diagnosis is required');
    }

    if (!report.pathologist_report?.consultant_pathologist) {
      errors.push('Consultant pathologist is required');
    }

    // Date validation
    if (report.pathologist_report?.date_of_request && 
        report.pathologist_report?.date_received &&
        new Date(report.pathologist_report.date_of_request) > new Date(report.pathologist_report.date_received)) {
      errors.push('Date of request cannot be after date received');
    }

    // Numeric validation
    if (report.macroscopy?.specimen_dimensions) {
      const dims = report.macroscopy.specimen_dimensions;
      if (dims.weight <= 0 || dims.length <= 0 || dims.width <= 0 || dims.height <= 0) {
        errors.push('Specimen dimensions must be positive numbers');
      }
    }

    if (report.microscopy?.axillary_node?.total_number !== undefined &&
        report.microscopy?.axillary_node?.number_positive !== undefined &&
        report.microscopy.axillary_node.number_positive > report.microscopy.axillary_node.total_number) {
      errors.push('Number of positive nodes cannot exceed total number of nodes');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Export report as PDF
   */
  exportReportPDF(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/export/pdf`, {
      responseType: 'blob',
      headers: { 'Accept': 'application/pdf' }
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Export multiple reports as Excel
   */
  exportReportsExcel(reportIds: string[]): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/export/excel`, 
      { report_ids: reportIds }, 
      {
        responseType: 'blob',
        headers: { 'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
      }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Transform dates from API format to local format if needed
   */
  private transformDatesFromApi<T extends any>(data: T): T {
    if (!data) return data;
    
    // Handle date transformations if your API returns dates in a different format
    // This is a placeholder - adjust based on your API's date format
    return data;
  }

  /**
   * Handle HTTP errors
   */
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status === 0) {
        errorMessage = 'Unable to connect to server. Please check your internet connection.';
      } else if (error.status === 404) {
        errorMessage = 'Report not found.';
      } else if (error.status === 422) {
        errorMessage = 'Invalid data provided.';
      } else if (error.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else {
        errorMessage = error.error?.message || `Server Error: ${error.status}`;
      }
    }

    console.error('ReportService Error:', error);
    return throwError(() => new Error(errorMessage));
  };


/**
 * Helper function to clean report data:
 * - Converts empty strings to 0
 * - Removes timezone from dates (keeps YYYY-MM-DD format)
 * @param {Object} obj - The report object to clean
 * @returns {Object} - The cleaned report object
 */
  private cleanReportData(obj: any) {
    // Create a deep copy to avoid modifying the original object
    const cleaned = JSON.parse(JSON.stringify(obj));
    
    // Fields that contain dates (add more as needed)
    const dateFields = [
      'reporting_date',
      'date_typed',
      'date_of_request',
      'date_received',
      'date_reviewed'
    ];

    return this.processObject(cleaned);
  }
  /**
   * Recursively process object properties
   */
  private processObject(item: any, path = ''):any {
    if (Array.isArray(item)) {
      // Handle arrays
      return item.map((element, index) => this.processObject(element, `${path}[${index}]`));
    } else if (item !== null && typeof item === 'object') {
      // Handle objects
      const processed: Record<string, any> = {};
      for (const [key, value] of Object.entries(item)) {
        processed[key] = this.processObject(value, path ? `${path}.${key}` : key);
      }
      return processed;
    } else {
      // Handle primitive values
      return this.processValue(item, path);
    }
  }
  
  /**
   * Process individual values
   */
  private processValue(value: string, fieldPath: string) {
    const fieldName = fieldPath.split('.').pop() || fieldPath;
    
    // Convert empty strings to 0
    if (value === '') {
      return 0;
    }
    
    // Process dates - remove timezone info
    // if (dateFields.includes(fieldName) && typeof value === 'string' && value.trim() !== '') {
    //   return this.cleanDateString(value);
    // }
    if ((fieldName.includes('date')) && typeof value === 'string' && value.trim() !== '') {
      return this.cleanDateString(value);
    }
    
    return value;
  }
  
  /**
   * Clean date string by removing timezone and keeping only YYYY-MM-DD
   */
  private cleanDateString(dateStr: string | number | Date) {
    try {
      // Handle various date formats
      const date = new Date(dateStr);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn(`Invalid date found: ${dateStr}`);
        return dateStr; // Return original if invalid
      }
      
      // Return in YYYY-MM-DD format
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.warn(`Error processing date: ${dateStr}`, error);
      return dateStr; // Return original if error
    }
  }
}