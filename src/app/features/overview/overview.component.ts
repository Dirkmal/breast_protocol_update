import { Component } from '@angular/core';

import { OverviewStatsComponent } from './components/overview-stats/overview-stats.component';

@Component({
  selector: 'app-overview',
  imports: [OverviewStatsComponent],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss',
})
export class OverviewComponent {}
