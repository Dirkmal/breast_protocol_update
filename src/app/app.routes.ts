import { Routes } from '@angular/router';

import { OverviewComponent } from './features/overview/overview.component';
import { PatientFormComponent } from './features/patients/patient-form/patient-form.component';
import { PatientListComponent } from './features/patients/patient-list/patient-list.component';
import { ReportFormComponent } from './features/reports/report-form/report-form.component';
import { ReportListComponent } from './features/reports/report-list/report-list.component';
import { SettingsComponent } from './features/settings/settings.component';

export const routes: Routes = [
  {
    path: '',
    component: OverviewComponent,
    title: 'Overview',
  },
  {
    path: 'patient/list',
    component: PatientListComponent,
    title: 'Patient List',
  },
  {
    path: 'report/list',
    component: ReportListComponent,
    title: 'Reports',
  },
  {
    path: 'patient/new',
    component: PatientFormComponent,
    title: 'New Patient',
  },
  {
    path: 'report/new',
    component: ReportFormComponent,
    title: 'New Report',
  },
  {
    path: 'settings',
    component: SettingsComponent,
    title: 'Settings',
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'report/new',
  },
];
