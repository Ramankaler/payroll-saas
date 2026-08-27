import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { API_BASE_URL } from '../../../core/config/api.config';
import { AuthSessionService } from '../../../core/services/auth-session.service';
import { EmployeeService } from '../../employees/employee.service';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { NgSelectModule } from '@ng-select/ng-select';

interface AttendanceLog {
  attID: number;
  empID: number;
  empCode: string;
  firstName: string;
  lastName: string;
  punchTime: string;
  punchType: string;
  deviceID: string;
}

interface AttendanceEmployee {
  empID: number;
  empCode: string;
  firstName: string;
  lastName: string;
  name: string;
  label: string;
}

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    NgSelectModule
  ],
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss'],
})

export class AttendanceComponent implements OnInit {
  readonly displayedColumns = [
    'employee',
    'punchTime',
    'punchType',
    'device',
  ];

  attendanceLogs: AttendanceLog[] = [];
  calendarLogs: AttendanceLog[] = [];
  employeeOptions: AttendanceEmployee[] = [];
  pagedLogs: AttendanceLog[] = [];

  selectedEmpCode: string | null = null;
  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();
  pageIndex = 0;
  pageSize = 10;
  totalRecords = 0;
  totalEmployees = 0;
  checkInCount = 0;
  checkOutCount = 0;

  file: File | null = null;
  loading = false;
  message = '';
  error = '';
  private employeeSearchTimer: any = null;

  readonly months = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' },
  ];

  readonly years = [2024, 2025, 2026, 2027];

  constructor(
    private readonly http: HttpClient,
    private readonly session: AuthSessionService,
    private readonly employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';

    const params = new URLSearchParams();
    params.set('month', String(this.selectedMonth));
    params.set('year', String(this.selectedYear));
    params.set('page', String(this.pageIndex + 1));
    params.set('pageSize', String(this.pageSize));

    if (this.selectedEmpCode) {
      params.set('empCode', this.selectedEmpCode);
    }

    this.http.get<any>(
      `${API_BASE_URL}/api/attendance/company/${this.session.companyId}/page?${params.toString()}`
    ).subscribe({
      next: (result) => {
        this.attendanceLogs = result?.data ?? [];
        this.totalRecords = result?.totalRecords ?? 0;
        this.totalEmployees = result?.totalEmployees ?? 0;
        this.checkInCount = result?.checkInCount ?? 0;
        this.checkOutCount = result?.checkOutCount ?? 0;
        this.updatePagedLogs();
        this.loading = false;
        this.loadCalendar();
      },
      error: (error) => {
        this.loading = false;
        this.error = error?.error?.message ?? 'Attendance could not be loaded.';
      },
    });
  }

  loadEmployees(search: string = ''): void {
    this.employeeService.lookup(search, 20).subscribe({
      next: (employees) => {
        this.employeeOptions = (employees ?? []).map((employee: any) => {
          const name =
            `${employee.firstName || ''} ${employee.lastName || ''}`.trim() ||
            'Employee';

          return {
            empID: employee.empID,
            empCode: employee.empCode,
            firstName: employee.firstName,
            lastName: employee.lastName,
            name,
            label: `${employee.empCode} - ${name}`
          };
        });

        this.keepSelectedEmployeeIfAvailable();
      },
      error: () => {
        this.employeeOptions = [];
      }
    });
  }

  onEmployeeSearch(value: any): void {
    const searchText =
      typeof value === 'string'
        ? value
        : value?.term ?? '';

    if (this.employeeSearchTimer) {
      clearTimeout(this.employeeSearchTimer);
    }

    this.employeeSearchTimer = setTimeout(() => {
      this.loadEmployees(searchText);
    }, 300);
  }

  private keepSelectedEmployeeIfAvailable(): void {
    if (!this.selectedEmpCode) {
      return;
    }

    const exists = this.employeeOptions
      .some(emp => emp.empCode === this.selectedEmpCode);

    if (!exists) {
      this.selectedEmpCode = null;
    }
  }

  get filteredLogs(): AttendanceLog[] {
    return this.attendanceLogs;
  }

  get calendarDays(): any[] {
    const daysInMonth =
      new Date(this.selectedYear, this.selectedMonth, 0).getDate();

    return Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      const punches = this.calendarLogs
        .filter(log => new Date(log.punchTime).getDate() === day)
        .sort((a, b) =>
          new Date(a.punchTime).getTime() -
          new Date(b.punchTime).getTime());

      const checkIns = punches.filter(log => log.punchType === 'CheckIn');
      const checkOuts = punches.filter(log => log.punchType === 'CheckOut');

      return {
        day,
        punches,
        firstIn: checkIns[0]?.punchTime,
        lastOut: checkOuts[checkOuts.length - 1]?.punchTime,
        status: this.getDayStatus(punches, checkIns.length, checkOuts.length),
        className: this.getDayClass(punches, checkIns.length, checkOuts.length)
      };
    });
  }

  formatTime(value: string | undefined): string {
    if (!value) {
      return '-';
    }

    return new Date(value).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  onFilterChange(): void {
    this.pageIndex = 0;
    this.load();
  }

  onEmployeeChange(): void {
    this.pageIndex = 0;
    this.load();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.file = input.files?.[0] ?? null;
  }

  importCsv(): void {
    if (!this.file) return;

    const form = new FormData();
    form.append('file', this.file);

    this.loading = true;
    this.error = '';
    this.message = '';

    this.http.post<any>(
      `${API_BASE_URL}/api/attendance/import?compId=${this.session.companyId}`,
      form
    ).subscribe({
      next: (result) => {
        this.loading = false;
        this.message = `${result.importedRecords ?? 0} attendance records imported.`;
        this.load();
      },
      error: (error) => {
        this.loading = false;
        this.error = error?.error?.message ?? 'CSV import failed.';
      },
    });
  }

  private getDayStatus(
    punches: AttendanceLog[],
    checkInCount: number,
    checkOutCount: number
  ): string {
    if (punches.length === 0) {
      return 'No Punch';
    }

    if (!this.selectedEmpCode) {
      return `${punches.length} Punches`;
    }

    if (checkInCount > 0 && checkOutCount > 0) {
      return 'Complete';
    }

    return 'Missing';
  }

  private getDayClass(
    punches: AttendanceLog[],
    checkInCount: number,
    checkOutCount: number
  ): string {
    if (punches.length === 0) {
      return 'day-empty';
    }

    if (!this.selectedEmpCode) {
      return 'day-has-punch';
    }

    if (checkInCount > 0 && checkOutCount > 0) {
      return 'day-complete';
    }

    return 'day-missing';
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.load();
  }

  updatePagedLogs(): void {
    this.pagedLogs = this.attendanceLogs;
  }

  private loadCalendar(): void {
    if (!this.selectedEmpCode) {
      this.calendarLogs = [];
      return;
    }

    const params = new URLSearchParams();
    params.set('month', String(this.selectedMonth));
    params.set('year', String(this.selectedYear));
    params.set('empCode', this.selectedEmpCode);

    this.http.get<AttendanceLog[]>(
      `${API_BASE_URL}/api/attendance/company/${this.session.companyId}?${params.toString()}`
    ).subscribe({
      next: (logs) => {
        this.calendarLogs = logs ?? [];
      },
      error: () => {
        this.calendarLogs = [];
      }
    });
  }

}
