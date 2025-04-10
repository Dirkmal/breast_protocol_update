import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Patient } from '../../../core/models/patient.model';
import { PatientService } from '../../../core/services/patient.service';
import { PatientFormComponent } from '../patient-form/patient-form.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Router } from '@angular/router';
import { MaterialModule } from '../../../shared/material.module';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-patient-list',
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.scss'],
  imports: [MaterialModule, CommonModule]
})
export class PatientListComponent implements OnInit {
  displayedColumns: string[] = [
    'hospitalNumber', 
    'name', 
    'dateOfBirth', 
    'gender', 
    'contactNumber',
    'createdAt', 
    'actions'
  ];
  dataSource = new MatTableDataSource<Patient>([]);
  loading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private patientService: PatientService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    // this.loadPatients();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
    // Custom sort function for full name
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch(property) {
        case 'name': return item.firstName + ' ' + item.lastName;
        default: return (item as any)[property];
      }
    };
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // loadPatients(): void {
  //   this.loading = true;
  //   this.patientService.getPatients().subscribe({
  //     next: (patients) => {
  //       this.dataSource.data = patients;
  //       this.loading = false;
  //     },
  //     error: (error) => {
  //       this.snackBar.open('Failed to load patients', 'Close', { duration: 5000 });
  //       this.loading = false;
  //     }
  //   });
  // }

  openPatientForm(patient?: Patient): void {
    const dialogRef = this.dialog.open(PatientFormComponent, {
      width: '800px',
      height: '100%',
      data: { patient }
    });

    // dialogRef.afterClosed().subscribe(result => {
    //   if (result) {
    //     this.loadPatients();
    //   }
    // });
  }

  viewReports(patientId: string): void {
    this.router.navigate(['/reports'], { queryParams: { patientId } });
  }

  createReport(patientId: string): void {
    this.router.navigate(['/reports/new'], { queryParams: { patientId } });
  }

  getAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
}