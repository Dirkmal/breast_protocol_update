import domtoimage from 'dom-to-image';
import { jsPDF } from 'jspdf';

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Report } from '../../../core/models/report.model';
import { ReportsService } from '../../../core/services/data.service';

@Component({
  selector: 'app-report-print',
  templateUrl: './report-print.component.html',
  styleUrls: ['./report-print.component.scss'],
})
export class ReportPrintComponent implements OnInit {
  report?: Report;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ds: ReportsService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params.hasOwnProperty('id')) {
        const id = params['id'];
        this.ds.getReport(id).subscribe(
          (res) => {
            this.report = res;
          },
          (err) => {
            // this.alert_s.newAlert(
            //   new Alert({
            //     message: 'An error occurred',
            //   })
            // );
          }
        );
      } else {
        this.router.navigate(['report/all']);
      }
    });
  }

  generatePdf() {
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
}
