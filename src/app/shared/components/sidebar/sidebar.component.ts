import { Component } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { CommonModule, NgIf } from '@angular/common';
import { MaterialModule } from '../../material.module';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports: [MaterialModule, RouterModule, CommonModule, RouterLink, RouterLinkActive]
})
export class SidebarComponent {
  // constructor(private authService: AuthService) {}

  // isAdmin(): boolean {
  //   return this.authService.isAdmin();
  // }
  isSidenavOpen = true;

  toggleSidenav(): void {
    this.isSidenavOpen = !this.isSidenavOpen;
  }
}