import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { SelfServiceApi } from './self-service.api';

@Component({
  selector: 'app-my-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-box">
      <h1>My Attendance</h1>
      <p>View your attendance summaries and raw punches.</p>
    </div>

    <div class="filter-card">
      <label>From<br><input type="date" [(ngModel)]="from"></label>
      <label>To<br><input type="date" [(ngModel)]="to"></label>
      <button type="button" (click)="load()">View</button>
    </div>

    <p *ngIf="error" class="error-text">{{ error }}</p>

    <table class="simple-table">
      <thead><tr><th>Date</th><th>Hours</th><th>Overtime</th><th>Status</th></tr></thead>
      <tbody>
        <tr *ngFor="let item of rows">
          <td>{{ item.attDate | date:'mediumDate' }}</td>
          <td>{{ item.totalHours }}</td>
          <td>{{ item.overtimeHours }}</td>
          <td>{{ item.isAbsent ? 'Absent' : (item.isLate ? 'Late' : 'Present') }}</td>
        </tr>
      </tbody>
    </table>
    <p *ngIf="!rows.length && !error" class="muted">No attendance found.</p>

    <h2>My Punches</h2>
    <table class="simple-table">
      <thead><tr><th>Date and time</th><th>Type</th><th>Device</th></tr></thead>
      <tbody>
        <tr *ngFor="let punch of punches">
          <td>{{ punch.punchTime | date:'medium' }}</td>
          <td>{{ punch.punchType }}</td>
          <td>{{ punch.deviceID }}</td>
        </tr>
      </tbody>
    </table>
    <p *ngIf="!punches.length && !error" class="muted">No punches found.</p>
  `,
  styles: [`
    .page-box{margin-bottom:18px}
    .page-box p,.muted{color:#64748b}
    .filter-card{display:flex;gap:12px;align-items:flex-end;flex-wrap:wrap;margin-bottom:20px;padding:16px;border:1px solid #e5e7eb;border-radius:12px;background:#fff}
    input{padding:9px;border:1px solid #cbd5e1;border-radius:8px}
    button{padding:10px 16px;border:0;border-radius:8px;background:#2563eb;color:#fff}
    h2{margin-top:28px}
    .simple-table{width:100%;border-collapse:collapse;background:#fff}
    th,td{border-bottom:1px solid #e5e7eb;padding:10px;text-align:left}
    .error-text{color:#b00020}
  `],
})
export class MyAttendanceComponent implements OnInit {
  from = '';
  to = '';
  rows: any[] = [];
  punches: any[] = [];
  error = '';

  constructor(private readonly api: SelfServiceApi) {}

  ngOnInit(): void {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 30);
    this.to = this.toDateInput(today);
    this.from = this.toDateInput(start);
    this.load();
  }

  load(): void {
    this.error = '';
    forkJoin({
      summaries: this.api.attendance(this.from, this.to),
      punches: this.api.attendancePunches(this.from, this.to),
    }).subscribe({
      next: (data) => {
        this.rows = data.summaries;
        this.punches = data.punches;
      },
      error: (error) => this.error = error?.error?.message ?? 'Attendance could not be loaded.',
    });
  }

  private toDateInput(value: Date): string {
    return value.toISOString().slice(0, 10);
  }
}
