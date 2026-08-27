import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { API_BASE_URL, API_ROUTES } from '../../core/config/api.config';
import { AuthSessionService } from '../../core/services/auth-session.service';

@Component({
  selector: 'app-advance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="simple-page">
      <div class="page-head">
        <div>
          <h1>Salary Advances</h1>
          <p>Request, approve, reject, and track employee salary advances.</p>
        </div>
        <button type="button" class="btn primary" (click)="load()">Refresh</button>
      </div>

      <div class="grid two">
        <div class="card">
          <h2>New Advance</h2>

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

          <label>Amount</label>
          <input type="number" [(ngModel)]="req.amount" />

          <label>Deduct % Per Month</label>
          <input type="number" [(ngModel)]="req.deductPercent" />

          <label>Fixed Deduction Amount Optional</label>
          <input type="number" [(ngModel)]="req.deductAmount" />

          <label>Reason</label>
          <textarea [(ngModel)]="req.reason" rows="3"></textarea>

          <button type="button" class="btn primary" (click)="create()">Save Advance</button>
          <p class="msg" *ngIf="message">{{ message }}</p>
        </div>

        <div class="card">
          <h2>Rules</h2>
          <p>Approved advance balance is deducted during payroll.</p>
          <p>If fixed amount is blank, payroll deducts {{ req.deductPercent || 10 }}% monthly.</p>
          <p>Finalized payroll posts advance recovery only once.</p>
        </div>
      </div>

      <div class="card table-card">
        <h2>Advance List</h2>
        <p *ngIf="loading">Loading advances...</p>

        <div class="table-wrap" *ngIf="!loading">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Amount</th>
                <th>Paid</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Reason</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of rows">
                <td>{{ item.empCode }} - {{ item.firstName }} {{ item.lastName }}</td>
                <td>{{ item.amount | number:'1.2-2' }}</td>
                <td>{{ item.paidAmount | number:'1.2-2' }}</td>
                <td>{{ item.balance | number:'1.2-2' }}</td>
                <td><span class="pill">{{ item.status }}</span></td>
                <td>{{ item.reason }}</td>
                <td class="actions">
                  <button type="button" class="btn ok" (click)="status(item.advanceID, 'Approved')">Approve</button>
                  <button type="button" class="btn warn" (click)="status(item.advanceID, 'Rejected')">Reject</button>
                  <button type="button" class="btn light" (click)="cancel(item.advanceID)">Cancel</button>
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
export class AdvanceComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthSessionService);

  rows: any[] = [];
  employees: any[] = [];
  employeeSearch = '';
  loading = false;
  message = '';
  req = {
    empID: 0,
    amount: 0,
    deductPercent: 10,
    deductAmount: null as number | null,
    reason: '',
  };

  ngOnInit(): void {
    this.load();
    this.loadEmployees();
  }

  load(): void {
    this.loading = true;
    this.http.get<any[]>(API_ROUTES.advanceBase).subscribe({
      next: rows => {
        this.rows = rows ?? [];
        this.loading = false;
      },
      error: err => {
        this.message = err?.error?.message ?? 'Advances could not be loaded.';
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
    this.http.post(API_ROUTES.advanceBase, this.req).subscribe({
      next: () => {
        this.message = 'Advance saved.';
        this.req = { empID: 0, amount: 0, deductPercent: 10, deductAmount: null, reason: '' };
        this.load();
      },
      error: err => this.message = err?.error?.message ?? 'Advance could not be saved.',
    });
  }

  status(id: number, status: 'Approved' | 'Rejected'): void {
    this.http.put(`${API_ROUTES.advanceBase}/${id}/status`, { status }).subscribe({
      next: () => this.load(),
      error: err => this.message = err?.error?.message ?? 'Status update failed.',
    });
  }

  cancel(id: number): void {
    this.http.put(`${API_ROUTES.advanceBase}/${id}/cancel`, {}).subscribe({
      next: () => this.load(),
      error: err => this.message = err?.error?.message ?? 'Cancel failed.',
    });
  }
}
