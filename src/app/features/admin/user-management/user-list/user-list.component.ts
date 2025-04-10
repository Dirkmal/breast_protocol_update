import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from '../../../../core/models/user.model';
import { UserService } from '../../../../core/services/user.service';
import { UserFormComponent } from '../user-form/user-form.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MaterialModule } from '../../../../shared/material.module';
import { CommonModule, NgClass } from '@angular/common';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  imports: [MaterialModule, NgClass, CommonModule]
})
export class UserListComponent implements OnInit {
  displayedColumns: string[] = ['firstName', 'lastName', 'email', 'role', 'department', 'active', 'actions'];
  dataSource = new MatTableDataSource<User>([]);
  loading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
    constructor(
      private userService: UserService,
      private dialog: MatDialog,
      private snackBar: MatSnackBar
    ) {}
  
    ngOnInit(): void {
      this.loadUsers();
    }
  
    ngAfterViewInit(): void {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  
    applyFilter(event: Event): void {
      const filterValue = (event.target as HTMLInputElement).value;
      this.dataSource.filter = filterValue.trim().toLowerCase();
  
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    }
  
    loadUsers(): void {
      this.loading = true;
      this.userService.getUsers().subscribe({
        next: (users) => {
          this.dataSource.data = users;
          this.loading = false;
        },
        error: (error) => {
          this.snackBar.open('Failed to load users', 'Close', { duration: 5000 });
          this.loading = false;
        }
      });
    }
  
    openUserForm(user?: User): void {
      const dialogRef = this.dialog.open(UserFormComponent, {
        width: '600px',
        data: { user }
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.loadUsers();
        }
      });
    }
  
    deleteUser(user: User): void {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '350px',
        data: {
          title: 'Delete User',
          message: `Are you sure you want to delete ${user.firstName} ${user.lastName}?`,
          confirmText: 'Delete',
          cancelText: 'Cancel'
        }
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result && user.id) {
          this.userService.deleteUser(user.id).subscribe({
            next: () => {
              this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
              this.loadUsers();
            },
            error: (error) => {
              this.snackBar.open('Failed to delete user', 'Close', { duration: 5000 });
            }
          });
        }
      });
    }
  
    toggleUserStatus(user: User): void {
      if (!user.id) return;
      
      const updatedUser = { ...user, active: !user.active };
      this.userService.updateUser(user.id, updatedUser).subscribe({
        next: () => {
          this.snackBar.open(`User ${user.active ? 'deactivated' : 'activated'} successfully`, 'Close', { duration: 3000 });
          this.loadUsers();
        },
        error: (error) => {
          this.snackBar.open('Failed to update user status', 'Close', { duration: 5000 });
        }
      });
    }
}
