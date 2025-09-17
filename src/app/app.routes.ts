import { Routes } from '@angular/router';

import { OverviewComponent } from './features/overview/overview.component';
import { PatientFormComponent } from './features/patients/patient-form/patient-form.component';
import { PatientListComponent } from './features/patients/patient-list/patient-list.component';
import { ReportFormComponent } from './features/reports/report-form/report-form.component';
import { ReportListComponent } from './features/reports/report-list/report-list.component';
import { SettingsComponent } from './features/settings/settings.component';
import { ReportUpdateComponent } from './features/reports/report-update/report-update.component';
import { ReportUpdateAltComponent } from './features/report-update-alt/report-update-alt.component';

export const routes: Routes = [
  // {
  //   path: '',
  //   component: OverviewComponent,
  //   title: 'Overview',
  // },
  {
    path: '',
    component: ReportListComponent,
    title: 'Reports',
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
  // { path: 'reports/update/:id', 
  //   component: ReportUpdateComponent, 
  //   title: 'Update Report'
  // },
  { path: 'reports/update/:id', 
    component: ReportUpdateAltComponent, 
    title: 'Update Report'
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
