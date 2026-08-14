import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { API_BASE_URL } from '../../../core/config/api.config';
import { AuthSessionService } from '../../../core/services/auth-session.service';

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

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatTableModule],
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
  selectedEmpCode = '';
  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();
  file: File | null = null;
  loading = false;
  message = '';
  error = '';

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
    private readonly session: AuthSessionService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';

    this.http.get<AttendanceLog[]>(
      `${API_BASE_URL}/api/attendance/company/${this.session.companyId}?month=${this.selectedMonth}&year=${this.selectedYear}`
    ).subscribe({
      next: (logs) => {
        this.attendanceLogs = logs;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.error = error?.error?.message ?? 'Attendance could not be loaded.';
      },
    });
  }

  get employees(): any[] {
    const map = new Map<string, any>();

    for (const log of this.attendanceLogs) {
      if (!map.has(log.empCode)) {
        map.set(log.empCode, {
          empCode: log.empCode,
          name: `${log.firstName} ${log.lastName}`.trim()
        });
      }
    }

    return Array.from(map.values())
      .sort((a, b) => a.empCode.localeCompare(b.empCode));
  }

  get filteredLogs(): AttendanceLog[] {
    if (!this.selectedEmpCode) {
      return this.attendanceLogs;
    }

    return this.attendanceLogs
      .filter(log => log.empCode === this.selectedEmpCode);
  }

  get totalEmployees(): number {
    return this.employees.length;
  }

  get checkInCount(): number {
    return this.filteredLogs
      .filter(log => log.punchType === 'CheckIn')
      .length;
  }

  get checkOutCount(): number {
    return this.filteredLogs
      .filter(log => log.punchType === 'CheckOut')
      .length;
  }

  get calendarDays(): any[] {
    const daysInMonth =
      new Date(this.selectedYear, this.selectedMonth, 0).getDate();

    return Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      const punches = this.filteredLogs
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
    this.selectedEmpCode = '';
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
}
