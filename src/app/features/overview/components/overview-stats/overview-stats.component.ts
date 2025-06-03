import { Component } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';

import { MaterialModule } from '../../../../shared/material.module';

@Component({
  selector: 'app-overview-stats',
  imports: [MaterialModule, RouterModule, RouterLink],
  templateUrl: './overview-stats.component.html',
  styleUrl: './overview-stats.component.scss',
})
export class OverviewStatsComponent {}
