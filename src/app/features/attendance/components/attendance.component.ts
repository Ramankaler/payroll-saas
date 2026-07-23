import { CommonModule } from '@angular/common';
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
  imports: [CommonModule, MatCardModule, MatButtonModule, MatTableModule],
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
  file: File | null = null;
  loading = false;
  message = '';
  error = '';

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
      `${API_BASE_URL}/api/attendance/company/${this.session.companyId}`
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
}
