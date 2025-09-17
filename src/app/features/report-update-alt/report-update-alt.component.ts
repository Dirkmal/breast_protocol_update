import { Component, OnInit } from '@angular/core';
import { Report } from '../../core/models/report.model';
import { MaterialModule } from '../../shared/material.module';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportsService } from '../../core/services/data.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import domtoimage from 'dom-to-image';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-report-update-alt',
  templateUrl: './report-update-alt.component.html',
  styleUrls: ['./report-update-alt.component.scss'],
  imports: [
    MaterialModule,
    CommonModule
  ]
})
export class ReportUpdateAltComponent implements OnInit {
  report!: Report;
  reportId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reportService: ReportsService,
    private snackBar: MatSnackBar
  ) {
    
  }

  ngOnInit(): void {
    let reportId = this.route.snapshot.paramMap.get('id') || '';
    
    if (reportId) {      
      this.loadReport(reportId);
    } else {
      this.snackBar.open('Report ID not found', 'Close', { duration: 3000 });
      this.router.navigate(['reports']);
    }
  }

  private loadReport(reportID: string): void {
    this.reportService.getReport(reportID).subscribe({
      next: (report: Report) => {
        this.report = report;
      },
      error: (error) => {
        console.error('Error loading report:', error);
        this.snackBar.open('Error loading report', 'Close', { duration: 3000 });
      }
    });
  }


  onPrint(): void {
    // Switch to view mode before printing
    setTimeout(() => {
      window.print();
    }, 100);
  }

  generatePDF() {
      if (!this.report) return;
  
      const filename = this.report.initial_details?.histology_number || 'report';
  
      const section = document.getElementById('printable_section');
      if (!section) return;
  
      domtoimage
        .toPng(section, {
          bgcolor: 'white',
          quality: 1,
        })
        .then((img) => {
          const pdf = new jsPDF('p', 'pt', 'a4');
          const width = pdf.internal.pageSize.getWidth();
          const height = pdf.internal.pageSize.getHeight();
          pdf.addImage(img, 'PNG', 0, 0, width, height);
          return pdf.save(`${filename}.pdf`);
        })
        .then(() => {
          // this.alert_s.newAlert(
          //   new Alert({
          //     message: `Report downloading as ${filename}.pdf`,
          //   })
          // );
        })
        .catch((error) => {
          // this.alert_s.newAlert(
          //   new Alert({
          //     message: `Failed to generate PDF: ${error.message}`,
          //   })
          // );
        });
    }

  // Helper methods for display
  getSpecimenTypes(): string {
    const types = [];
    const st = this.report.macroscopy.specimen_type;
    if (st.core_needle_biopsy) types.push('Core Needle Biopsy');
    if (st.wide_local_excision) types.push('Wide Local Excision');
    if (st.mastectomy) types.push('Mastectomy');
    if (st.open_biopsy) types.push('Open Biopsy');
    if (st.segmental_excision) types.push('Segmental Excision');
    if (st.wide_bore_needle_biopsy) types.push('Wide Bore Needle Biopsy');
    return types.join(', ') || 'None specified';
  }

  getAxillaryProcedures(): string {
    const procedures = [];
    const ap = this.report.macroscopy.axillary_procedure;
    if (ap.no_lymph_node_procedure) procedures.push('No lymph node procedure');
    if (ap.axillary_node_sample) procedures.push('Axillary node sample');
    if (ap.sentinel_node_biopsy) procedures.push('Sentinel node biopsy');
    if (ap.axillary_node_clearance) procedures.push('Axillary node clearance');
    if (ap.intrammary_node) procedures.push('Intrammary node');
    return procedures.join(', ') || 'None specified';
  }

  getSurgicalMarginsAffected(): string {
    const margins = [];
    const sma = this.report.microscopy.surgical_margins_actual;
    if (sma.superior) margins.push('Superior');
    if (sma.inferior) margins.push('Inferior');
    if (sma.anterior) margins.push('Anterior');
    if (sma.posterior) margins.push('Posterior');
    if (sma.lateral) margins.push('Lateral');
    if (sma.medial) margins.push('Medial');
    return margins.join(', ') || 'None';
  }
}