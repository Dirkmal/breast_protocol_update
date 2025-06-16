import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ReportPrintComponent } from './report-print/report-print.component';

const routes: Routes = [
  {
    path: ':/id/preview',
    component: ReportPrintComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportsRoutingModule {}
