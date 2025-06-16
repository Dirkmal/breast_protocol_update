import { Component } from '@angular/core';
import { ReportsService } from '../../../core/services/data.service';
// import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-report-print',
  imports: [],
  templateUrl: './report-print.component.html',
  styleUrl: './report-print.component.scss'
})
export class ReportPrintComponent {
  report?: Report;
	
	constructor(, private ds: ReportsService) { }

	ngOnInit(): void {
		this.route.params.subscribe(params => {
			if (params.hasOwnProperty('id')) {
				const id = params['id'];
			
				this.ds.findReportById(id).subscribe(res => {
					this.report = res.data;
				}, err => {
					this.alert_s.newAlert(new Alert({
						message: "An error occurred"
					}));
				});
			} else {
				this.router.navigate(['report/all']);
			}
		});
	}

	generatePdf() {
		const filename = this.report.patient.histology_num;
		
		domtoimage.toPng(document.getElementById('printable_section'), {
			bgcolor: 'white',
			quality: 1
		}).then(function (img) {
			const pdf = new jsPDF('p', 'pt', 'a4');

			const width = pdf.internal.pageSize.getWidth();
			const height = pdf.internal.pageSize.getHeight();

			pdf.addImage(img, 'PNG', 0, 0, width, height);
			return pdf.save(`${filename}.pdf`);
		}).then(() => {
			this.alert_s.newAlert(new Alert({
				message: `Report downloading as ${this.report.patient.histology_num}.pdf`
			}))
		});
	}
}
