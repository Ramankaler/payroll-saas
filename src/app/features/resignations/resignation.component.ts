import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { API_BASE_URL, API_ROUTES } from '../../core/config/api.config';
import { AuthSessionService } from '../../core/services/auth-session.service';

@Component({
  selector: 'app-resignation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="simple-page">
      <div class="page-head">
        <div>
          <h1>Resignations</h1>
          <p>Notice period, approval, and auto inactive tracking.</p>
        </div>
        <button type="button" class="btn primary" (click)="load()">Refresh</button>
      </div>

      <div class="grid two">
        <div class="card">
          <h2>New Resignation</h2>

          <label>Search Employee</label>
          <input
            type="text"
            [(ngModel)]="employeeSearch"
            (input)="loadEmployees()"
            placeholder="Type employee code or name"
          />

          <label>Employee</label>
          <select [(ngModel)]="req.empID">
            <option [ngValue]="0">Select employee</option>
            <option *ngFor="let emp of employees" [ngValue]="emp.empID">
              {{ emp.empCode }} - {{ emp.firstName }} {{ emp.lastName }}
            </option>
          </select>

          <label>Resignation Date</label>
          <input type="date" [(ngModel)]="req.resignDate" />

          <label>Notice Days Optional</label>
          <input type="number" [(ngModel)]="req.noticeDays" />

          <label>Reason</label>
          <textarea [(ngModel)]="req.reason" rows="3"></textarea>

          <button type="button" class="btn primary" (click)="create()">Save Resignation</button>
          <p class="msg" *ngIf="message">{{ message }}</p>
        </div>

        <div class="card">
          <h2>Rules</h2>
          <p>If notice days is blank, company setting is used.</p>
          <p>After approval, employee status becomes Resigned Notice.</p>
          <p>After last date + 7 days, process due makes user inactive.</p>
          <button type="button" class="btn light" (click)="processDue()">Process Due Inactive</button>
        </div>
      </div>

      <div class="card table-card">
        <h2>Resignation List</h2>
        <p *ngIf="loading">Loading resignations...</p>

        <div class="table-wrap" *ngIf="!loading">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Resign Date</th>
                <th>Last Date</th>
                <th>Inactive After</th>
                <th>Status</th>
                <th>Reason</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of rows">
                <td>{{ item.empCode }} - {{ item.firstName }} {{ item.lastName }}</td>
                <td>{{ item.resignDate | date:'dd MMM yyyy' }}</td>
                <td>{{ item.lastDate | date:'dd MMM yyyy' }}</td>
                <td>{{ item.inactiveAfter | date:'dd MMM yyyy' }}</td>
                <td><span class="pill">{{ item.status }}</span></td>
                <td>{{ item.reason }}</td>
                <td class="actions">
                  <button type="button" class="btn ok" (click)="status(item.resigID, 'Approved')">Approve</button>
                  <button type="button" class="btn warn" (click)="status(item.resigID, 'Rejected')">Reject</button>
                  <button type="button" class="btn light" (click)="cancel(item.resigID)">Cancel</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .simple-page { display: grid; gap: 1.25rem; }
    .page-head { display: flex; justify-content: space-between; gap: 1rem; align-items: center; }
    h1, h2, p { margin-top: 0; }
    .grid.two { display: grid; grid-template-columns: 1.5fr 1fr; gap: 1rem; }
    .card { background: #fff; border: 1px solid #e5e7eb; border-radius: 18px; padding: 1rem; box-shadow: 0 12px 30px rgba(15,23,42,.06); }
    label { display: block; margin: .75rem 0 .25rem; font-weight: 600; }
    input, select, textarea { width: 100%; border: 1px solid #cbd5e1; border-radius: 12px; padding: .65rem .75rem; }
    .btn { border: 0; border-radius: 999px; padding: .55rem .9rem; cursor: pointer; margin: .25rem; }
    .primary { background: #2563eb; color: white; }
    .ok { background: #dcfce7; color: #166534; }
    .warn { background: #fee2e2; color: #991b1b; }
    .light { background: #f1f5f9; color: #334155; }
    .table-wrap { overflow: auto; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: .75rem; border-bottom: 1px solid #e5e7eb; text-align: left; }
    .pill { background: #eef2ff; color: #3730a3; padding: .25rem .55rem; border-radius: 999px; }
    .actions { white-space: nowrap; }
    .msg { color: #2563eb; margin-top: .75rem; }
    @media (max-width: 900px) { .grid.two { grid-template-columns: 1fr; } }
  `],
})
export class ResignationComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthSessionService);

  rows: any[] = [];
  employees: any[] = [];
  employeeSearch = '';
  loading = false;
  message = '';
  req = {
    empID: 0,
    resignDate: '',
    noticeDays: 0,
    reason: '',
  };

  ngOnInit(): void {
    this.load();
    this.loadEmployees();
  }

  load(): void {
    this.loading = true;
    this.http.get<any[]>(API_ROUTES.resignationBase).subscribe({
      next: rows => {
        this.rows = rows ?? [];
        this.loading = false;
      },
      error: err => {
        this.message = err?.error?.message ?? 'Resignations could not be loaded.';
        this.loading = false;
      },
    });
  }

  loadEmployees(): void {
    const compID = this.auth.companyId ?? 0;
    const url = `${API_BASE_URL}/api/employee/${compID}/page`;

    this.http.get<any>(url, {
      params: {
        page: 1,
        pageSize: 25,
        search: this.employeeSearch,
      } as any,
    }).subscribe({
      next: result => this.employees = result?.data ?? [],
      error: () => this.employees = [],
    });
  }

  create(): void {
    this.http.post(API_ROUTES.resignationBase, this.req).subscribe({
      next: () => {
        this.message = 'Resignation saved.';
        this.req = { empID: 0, resignDate: '', noticeDays: 0, reason: '' };
        this.load();
      },
      error: err => this.message = err?.error?.message ?? 'Resignation could not be saved.',
    });
  }

  status(id: number, status: 'Approved' | 'Rejected'): void {
    this.http.put(`${API_ROUTES.resignationBase}/${id}/status`, { status }).subscribe({
      next: () => this.load(),
      error: err => this.message = err?.error?.message ?? 'Status update failed.',
    });
  }

  cancel(id: number): void {
    this.http.put(`${API_ROUTES.resignationBase}/${id}/cancel`, {}).subscribe({
      next: () => this.load(),
      error: err => this.message = err?.error?.message ?? 'Cancel failed.',
    });
  }

  processDue(): void {
    this.http.post(`${API_ROUTES.resignationBase}/process-due`, {}).subscribe({
      next: (result: any) => {
        this.message = `${result?.completed ?? 0} employees processed.`;
        this.load();
      },
      error: err => this.message = err?.error?.message ?? 'Process failed.',
    });
  }
}
