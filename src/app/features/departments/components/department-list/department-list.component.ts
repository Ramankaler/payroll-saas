import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { DepartmentService } from '../../services/department.service';
import { DepartmentDialogComponent } from '../department-dialog/department-dialog.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { AuthSessionService } from '../../../../core/services/auth-session.service';

interface DepartmentDto {
  deptID: number;
  deptName: string;
}

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    FormsModule,MatPaginatorModule,MatSortModule
  ],
  templateUrl: './department-list.component.html',
  styleUrls: ['./department-list.component.scss']
})
export class DepartmentListComponent implements OnInit {
  private readonly authSession =  inject(AuthSessionService);
  departments: DepartmentDto[] = [];
  filteredDepartments: DepartmentDto[] = [];
  displayedColumns: string[] = ['deptName', 'actions'];
  searchTerm = '';

  pageSize = 5;
pageIndex = 0;
pagedDepartments: any[] = [];

  constructor(
    private deptSrv: DepartmentService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.deptSrv.getAll( this.authSession.companyId).subscribe({
      next: (res: any[]) => {
        this.departments = res || [];
        this.filteredDepartments = [...this.departments];
this.updatePagedData();
      },
      error: (e) => console.error('Department load error:', e)
    });
  }

  addDepartment() {
    const dialogRef = this.dialog.open(DepartmentDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadDepartments();
        this.snackBar.open('Department added', 'Close', { duration: 3000 });
      }
    });
  }

  applyFilter(event: any) {
    const term = event.target.value.toLowerCase();
    this.filteredDepartments = this.departments.filter(dept =>
      dept.deptName.toLowerCase().includes(term)
    );
    this.pageIndex = 0;
this.updatePagedData();
  }

  editDepartment(dept: DepartmentDto) {
    const dialogRef = this.dialog.open(DepartmentDialogComponent, {
      width: '400px',
      data: { isEdit: true, dept }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadDepartments();
        this.snackBar.open('Department updated', 'Close', { duration: 3000 });
      }
    });
  }

sortData(sort: Sort) {

  const data = [...this.filteredDepartments];

  if (!sort.active || sort.direction === '') {
    this.filteredDepartments = data;
  } else {
    this.filteredDepartments = data.sort((a, b) => {
      const valueA = a.deptName.toLowerCase();
      const valueB = b.deptName.toLowerCase();

      return (valueA < valueB ? -1 : 1) * (sort.direction === 'asc' ? 1 : -1);
    });
  }

  this.updatePagedData();
}


updatePagedData(){
  const start = this.pageIndex * this.pageSize;
  const end = start + this.pageSize;
  this.pagedDepartments = this.filteredDepartments.slice(start, end);
}
onPageChange(event: any) {
  this.pageIndex = event.pageIndex;
  this.pageSize = event.pageSize;
  this.updatePagedData();
}
}

