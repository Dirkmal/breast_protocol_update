import { Component } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { NgIf } from '@angular/common';
import { MaterialModule } from '../../material.module';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports: [MaterialModule]
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