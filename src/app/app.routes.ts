import { Routes } from '@angular/router';
import { PatientListComponent } from './features/patients/patient-list/patient-list.component';
import path from 'path';
import { ReportListComponent } from './features/reports/report-list/report-list.component';
import { PatientFormComponent } from './features/patients/patient-form/patient-form.component';
import { ReportFormComponent } from './features/reports/report-form/report-form.component';
import { AlteReportFormComponent } from './features/reports/alte-report-form/alte-report-form.component';

export const routes: Routes = [
    {
        path: '',
        component: PatientListComponent,
        title: 'Patient List'
    },
    {
        path: 'alte',
        component: AlteReportFormComponent,
        title: 'Alte'
    },
    {
        path: 'patient/list',
        component: PatientListComponent,
        title: 'Patient List'
    },
    {
        path: 'report/list',
        component: ReportListComponent,
        title: 'Reports'
    },
    {
        path: 'patient/new',
        component: PatientFormComponent,
        title: 'New Patient'
    },
    {
        path: 'report/new',
        component: ReportFormComponent,
        title: 'New Report'
    },
    {
        path: '**', 
        pathMatch: 'full', 
        redirectTo: 'report/new'
    }
];
