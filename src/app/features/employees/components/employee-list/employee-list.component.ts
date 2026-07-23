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
  Observable,
  Subject,
  debounceTime,
  distinctUntilChanged,
  takeUntil,
} from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import {
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { EmployeeService } from '../../employee.service';
import { AuthSessionService } from '../../../../core/services/auth-session.service';


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
  private readonly authSession = inject(AuthSessionService);
  private readonly snack = inject(MatSnackBar);
  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject = new Subject<string>();

  @ViewChild(MatSort) set sort(s: MatSort) {
    if (s) this.dataSource.sort = s;
  }

  readonly displayedColumns = [
    'empCode',
    'bioID',
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
  totalRecords = 0;
  pageIndex = 0;
  pageSize = 25;
  loading = true;
  searchTerm = '';
  deletingId: number | null = null;

  ngOnInit(): void {
    this.loadEmployees();

    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.pageIndex = 0;
        this.loadEmployees();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadEmployees(): void {
    this.loading = true;
    this.svc
      .getPage(
        this.authSession.companyId,
        this.pageIndex + 1,
        this.pageSize,
        this.searchTerm
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.allEmployees = result?.data ?? [];
          this.totalRecords = result?.totalRecords ?? 0;
          this.dataSource.data = this.enrichList(this.allEmployees);
          this.loading = false;
        },
        error: () => {
          this.allEmployees = [];
          this.dataSource.data = [];
          this.totalRecords = 0;
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
    this.pageIndex = 0;
    this.loadEmployees();
  }

  onPage(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadEmployees();
  }

toggleActive(emp: any): void {
  const newStatus = !emp.isActive;

  this.svc
    .updateStatus(emp.empID, newStatus)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        emp.isActive = newStatus;

        this.snack.open(
          `Employee ${newStatus ? 'activated' : 'deactivated'}.`,
          'OK',
          { duration: 3000 }
        );

        this.dataSource.data = this.enrichList(this.allEmployees);
      },
      error: () => {
        this.snack.open(
          'Failed to update status.',
          'Dismiss',
          { duration: 4000 }
        );
      },
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

  get hasNoData(): boolean {
    return !this.loading && this.totalRecords === 0 && !this.searchTerm.trim();
  }

  get hasNoSearchResults(): boolean {
    return (
      !this.loading &&
      this.totalRecords === 0 &&
      this.searchTerm.trim().length > 0
    );
  }
}
