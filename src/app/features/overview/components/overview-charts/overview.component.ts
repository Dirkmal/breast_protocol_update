import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { RouterModule } from '@angular/router';

import { MaterialModule } from '../../../../shared/material.module';

@Component({
  selector: 'app-overview-charts',
  imports: [MaterialModule, RouterModule],
  templateUrl: './overview-charts.component.html',
  styleUrl: './overview-charts.component.scss',
})
export class OverviewChartsComponent implements OnInit {
  displayedColumns: string[] = [
    'hospitalNumber',
    'name',
    'dateOfBirth',
    'gender',
    'contactNumber',
    'createdAt',
  ];

  dataSource = new MatTableDataSource([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {}
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}
