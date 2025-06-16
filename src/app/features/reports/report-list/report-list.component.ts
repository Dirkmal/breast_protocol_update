import { Component, ViewChild } from '@angular/core';
import { MaterialModule } from '../../../shared/material.module';
import { CommonModule } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { Report } from '../../../core/models/report.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ReportsService } from '../../../core/services/data.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-report-list',
  imports: [MaterialModule, CommonModule],
  templateUrl: './report-list.component.html',
  styleUrl: './report-list.component.scss'
})
export class ReportListComponent {
  displayedColumns: string[] = [
    'Report ID',
    'Patient Name', 
    'Hospital Number', 
    'actions'
  ];
  dataSource = new MatTableDataSource<Report>([]);
  loading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private ds: ReportsService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadReports();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
    // Custom sort function for full name
    // this.dataSource.sortingDataAccessor = (item, property) => {
    //   switch(property) {
    //     case 'name': return item.firstName + ' ' + item.lastName;
    //     default: return (item as any)[property];
    //   }
    // };
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  loadReports(): void {
    this.loading = true;
    this.ds.getAllReports().subscribe({
      next: (reports) => {
        this.dataSource.data = reports;
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Failed to load reports', 'Close', { duration: 5000 });
        this.loading = false;
      }
    });
  }

  

  // createReport(patientId: string): void {
  //   this.router.navigate(['/reports/new'], { queryParams: { patientId } });
  // }
}
