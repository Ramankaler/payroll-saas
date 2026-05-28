import { Component, inject, OnInit, ViewChild, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Observable, of, Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { EmployeesApi, type EmployeeDto, type EmployeeCreateRequest } from '../../data/employees.api';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

interface EmployeeExtended extends EmployeeDto {
  fullName: string;
}

// Forward reference to avoid "used before declaration" error
const EmployeeFormDialogForwardRef = forwardRef(() => EmployeeFormDialogComponent);

@Component({
  selector: 'app-employees-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    EmployeeFormDialogForwardRef,
  ],
  templateUrl: './employees-page.component.html',
  styleUrls: ['./employees-page.component.scss'],
})
export class EmployeesPageComponent implements OnInit {
  private readonly api = inject(EmployeesApi);
  private readonly dialog = inject(MatDialog);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = ['employeeId', 'empCode', 'fullName', 'email', 'status', 'basicSalary'];
  employees: EmployeeDto[] = [];
  filteredData: EmployeeExtended[] = [];
  loading = true;
  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.loadEmployees();
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((search) => this.filterEmployees(search)),
    ).subscribe((filtered) => (this.filteredData = filtered));
  }

  loadEmployees(): void {
    this.loading = true;
    this.api.list().subscribe({
      next: (list) => {
        this.employees = list || [];
        this.filteredData = this.enrichEmployees(this.employees);
        this.loading = false;
      },
      error: () => {
        this.employees = [];
        this.filteredData = [];
        this.loading = false;
      },
    });
  }

  enrichEmployees(employees: EmployeeDto[]): EmployeeExtended[] {
    return employees.map((e) => ({ ...e, fullName: `${e.firstName} ${e.lastName}` }));
  }

  onSearch(event: Event): void {
    const search = (event.target as HTMLInputElement).value;
    this.searchSubject.next(search);
  }

  private filterEmployees(search: string): Observable<EmployeeExtended[]> {
    if (!search.trim()) {
      return of(this.enrichEmployees(this.employees));
    }
    const filtered = this.enrichEmployees(this.employees).filter(
      (e) =>
        e.fullName.toLowerCase().includes(search.toLowerCase()) ||
        e.email.toLowerCase().includes(search.toLowerCase()) ||
        e.employeeId.toLowerCase().includes(search.toLowerCase()),
    );
    return of(filtered);
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(EmployeeFormDialogComponent, {
      width: '550px',
      data: null,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.api.create(result as EmployeeCreateRequest).subscribe({
          next: () => this.loadEmployees(),
          error: (err) => console.error('Failed to create employee', err),
        });
      }
    });
  }
}

// ─── Employee Form Dialog ──────────────────────────────────────────────

@Component({
  selector: 'app-employee-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSelectModule,
  ],
  templateUrl: './employee-form-dialog.component.html',
  styleUrls: ['./employee-form-dialog.component.scss'],
})
export class EmployeeFormDialogComponent {
  form = this.fb.group({
    empCode: [''],
    employeeId: ['', Validators.required],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    gender: [''],
    dob: [''],
    joiningDate: ['', Validators.required],
    basicSalary: [0, [Validators.required, Validators.min(0)]],
    allowancesAmount: [0],
    workLocation: [''],
  });

  constructor(private fb: FormBuilder, public dialogRef: MatDialogRef<EmployeeFormDialogComponent>) {}

  submit(): void {
    if (this.form.invalid) return;
    const v = this.form.value;
    this.dialogRef.close({
      empCode: v.employeeId?.trim() ?? '',
      employeeId: v.employeeId?.trim() ?? '',
      firstName: v.firstName?.trim() ?? '',
      lastName: v.lastName?.trim() ?? '',
      email: v.email?.trim() ?? '',
      phone: v.phone || null,
      gender: v.gender || null,
      dob: v.dob || null,
      joiningDate: v.joiningDate ?? new Date().toISOString().split('T')[0],
      basicSalary: v.basicSalary ?? 0,
      allowancesAmount: v.allowancesAmount ?? 0,
      workLocation: v.workLocation || null,
    } as EmployeeCreateRequest);
  }
}
