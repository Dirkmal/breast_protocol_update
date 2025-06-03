import { Component } from '@angular/core';

import { OverviewChartsComponent } from './components/overview-charts/overview.component';
import { OverviewStatsComponent } from './components/overview-stats/overview-stats.component';

@Component({
  selector: 'app-overview',
  imports: [OverviewStatsComponent, OverviewChartsComponent],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss',
})
export class OverviewComponent {}
