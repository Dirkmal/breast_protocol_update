import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginComponent } from "./features/auth/login/login.component";
import { ReportListComponent } from "./features/reports/report-list/report-list.component";
import { HeaderComponent } from "./shared/components/header/header.component";
import { SidebarComponent } from "./shared/components/sidebar/sidebar.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppComponent {
  title = 'breast_protocol_app';
}
