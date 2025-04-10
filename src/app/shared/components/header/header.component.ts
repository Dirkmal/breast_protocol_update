import { Component, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { User } from '../../../core/models/user.model';
import { MaterialModule } from '../../material.module';
import { EventEmitter } from 'stream';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [MaterialModule]
})
export class HeaderComponent {
  currentUser: User | null = null;

  // constructor(private authService: AuthService, private router: Router) {
  //   this.authService.currentUser$.subscribe(user => {
  //     this.currentUser = user;
  //   });
  // }

  // @Input() isSidenavOpen: boolean = false;
  // @Output() toggleSidenav = new EventEmitter<void>();

  // onToggleSidenav(): void {
  //   this.toggleSidenav.emit();
  // }

  logout(): void {
    // this.authService.logout();
    // this.router.navigate(['/auth/login']);
  }

  // isAdmin(): boolean {
  //   return this.authService.isAdmin();
  // }
}