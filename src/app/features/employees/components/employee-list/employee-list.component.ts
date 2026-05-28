import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  takeUntil,
} from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { EmployeeService } from '../../employee.service';

const DEFAULT_COMP_ID = 1;

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule,
  ],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss'],
})
export class EmployeeListComponent implements OnInit, OnDestroy {
  private readonly svc = inject(EmployeeService);
  private readonly snack = inject(MatSnackBar);
  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject = new Subject<string>();

  @ViewChild(MatPaginator) set paginator(p: MatPaginator) {
    if (p) this.dataSource.paginator = p;
  }
  @ViewChild(MatSort) set sort(s: MatSort) {
    if (s) this.dataSource.sort = s;
  }

  readonly displayedColumns = [
    'empCode',
    'fullName',
    'email',
    'phone',
    'deptID',
    'desigID',
    'status',
    'basicSalary',
    'actions',
  ];

  dataSource = new MatTableDataSource<any>([]);
  allEmployees: any[] = [];
  loading = true;
  searchTerm = '';
  deletingId: number | null = null;

  ngOnInit(): void {
    this.loadEmployees();

    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((term) => this.applyFilter(term));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadEmployees(): void {
    this.loading = true;
    this.svc
      .getAll(DEFAULT_COMP_ID)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (list) => {
          this.allEmployees = list ?? [];
          this.dataSource.data = this.enrichList(this.allEmployees);
          this.applyFilter(this.searchTerm);
          this.loading = false;
        },
        error: () => {
          this.allEmployees = [];
          this.dataSource.data = [];
          this.loading = false;
          this.snack.open('Failed to load employees.', 'Dismiss', { duration: 4000 });
        },
      });
  }

  onSearch(event: Event): void {
    const term = (event.target as HTMLInputElement).value;
    this.searchTerm = term;
    this.searchSubject.next(term);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.searchSubject.next('');
  }

  deleteEmployee(id: number): void {
    if (!confirm('Are you sure you want to delete this employee? This action cannot be undone.')) return;
    this.deletingId = id;
    this.svc
      .delete(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snack.open('Employee deleted successfully.', 'OK', { duration: 3000 });
          this.deletingId = null;
          this.loadEmployees();
        },
        error: () => {
          this.snack.open('Failed to delete employee.', 'Dismiss', { duration: 4000 });
          this.deletingId = null;
        },
      });
  }

  toggleActive(emp: any): void {
    this.svc
      .toggleActive(emp.empID)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          emp.isActive = !emp.isActive;
          this.snack.open(
            `Employee ${emp.isActive ? 'activated' : 'deactivated'}.`,
            'OK',
            { duration: 3000 },
          );
          this.dataSource.data = this.enrichList(this.allEmployees);
        },
        error: () =>
          this.snack.open('Failed to update status.', 'Dismiss', { duration: 4000 }),
      });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private enrichList(
    list: any[],
  ): any[] {
    return list.map((e) => ({
      ...e,
      fullName: `${e.firstName} ${e.lastName}`.trim(),
    }));
  }

  private applyFilter(term: string): void {
    const t = term.trim().toLowerCase();
    if (!t) {
      this.dataSource.data = this.enrichList(this.allEmployees);
      return;
    }
    this.dataSource.data = this.enrichList(
      this.allEmployees.filter(
        (e) =>
          e.empCode?.toLowerCase().includes(t) ||
          e.firstName?.toLowerCase().includes(t) ||
          e.lastName?.toLowerCase().includes(t) ||
          e.email?.toLowerCase().includes(t) ||
          e.phone?.toLowerCase().includes(t),
      ),
    );
  }

  get hasNoData(): boolean {
    return !this.loading && this.allEmployees.length === 0;
  }

  get hasNoSearchResults(): boolean {
    return (
      !this.loading &&
      this.allEmployees.length > 0 &&
      this.dataSource.data.length === 0 &&
      this.searchTerm.trim().length > 0
    );
  }
}
