import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { SelfServiceApi } from './self-service.api';

@Component({
  selector: 'app-my-gatepasses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-box">
      <div>
        <h1>My Gate Passes</h1>
        <p>Apply for short outside permission and track approval status.</p>
      </div>

      <button type="button" class="soft-button" (click)="load()" [disabled]="loading">
        {{ loading ? 'Loading...' : 'Refresh' }}
      </button>
    </div>

    <section class="quota-grid">
      <div class="quota-card">
        <span>Monthly limit</span>
        <strong>{{ timeLabel(monthlyLimitMinutes) }}</strong>
      </div>

      <div class="quota-card">
        <span>Used this month</span>
        <strong>{{ timeLabel(monthlyUsedMinutes) }}</strong>
      </div>

      <div class="quota-card">
        <span>Remaining</span>
        <strong>{{ timeLabel(monthlyRemainingMinutes) }}</strong>
      </div>
    </section>

    <form #gatePassForm="ngForm" class="simple-card" (ngSubmit)="apply(gatePassForm)">
      <h2>Apply Gate Pass</h2>

      <label>
        Out time *
        <input
          type="datetime-local"
          name="outTime"
          [(ngModel)]="model.outTime"
          required>
      </label>

      <label>
        Expected in time *
        <input
          type="datetime-local"
          name="expectedInTime"
          [(ngModel)]="model.expectedInTime"
          required>
      </label>

      <label>
        Reason *
        <textarea
          name="reason"
          [(ngModel)]="model.reason"
          maxlength="500"
          required
          placeholder="Example: Bank work, official visit, personal emergency"></textarea>
      </label>

      <label>
        Remarks
        <textarea
          name="remarks"
          [(ngModel)]="model.remarks"
          maxlength="500"></textarea>
      </label>

      <div class="hint-box">
        Minimum 10 minutes. Total allowed gate pass time is 4 hours per month.
      </div>

      <button type="submit" [disabled]="gatePassForm.invalid || saving">
        {{ saving ? 'Submitting...' : 'Submit Gate Pass' }}
      </button>
    </form>

    <p *ngIf="message" class="message-text">{{ message }}</p>
    <p *ngIf="error" class="error-text">{{ error }}</p>

    <section class="simple-card">
      <h2>My Gate Pass History</h2>

      <div class="loading-box" *ngIf="loading">
        Loading gate passes...
      </div>

      <table class="simple-table" *ngIf="!loading">
        <thead>
          <tr>
            <th>Planned Time</th>
            <th>Actual Time</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          <tr *ngFor="let item of gatePasses">
            <td>
              <strong>{{ item.outTime | date:'dd-MMM-yyyy HH:mm' }}</strong><br>
              <small>Expected in: {{ item.expectedInTime | date:'dd-MMM-yyyy HH:mm' }}</small><br>
              <small>Requested: {{ timeLabel(requestedMinutes(item)) }}</small>
            </td>

            <td>
              <span>Out: {{ item.actualOutTime ? (item.actualOutTime | date:'dd-MMM-yyyy HH:mm') : '-' }}</span><br>
              <span>In: {{ item.actualInTime ? (item.actualInTime | date:'dd-MMM-yyyy HH:mm') : '-' }}</span>
            </td>

            <td>
              {{ item.reason }}
              <small *ngIf="item.remarks"><br>{{ item.remarks }}</small>
            </td>

            <td>
              <span class="status-pill" [ngClass]="statusClass(item.status)">
                {{ item.status }}
              </span>
            </td>

            <td>
              <button
                *ngIf="canCancel(item)"
                type="button"
                class="danger-button"
                (click)="cancel(item.gatePassID)">
                Cancel
              </button>
            </td>
          </tr>

          <tr *ngIf="gatePasses.length === 0">
            <td colspan="5" class="empty-row">
              No gate pass found.
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  `,
  styles: [`
    .page-box {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      align-items: center;
      margin-bottom: 1rem;
    }

    .page-box h1,
    .simple-card h2 {
      margin: 0;
      color: #0f172a;
    }

    .page-box p {
      margin: 0.25rem 0 0;
      color: #64748b;
    }

    .quota-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .quota-card,
    .simple-card {
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      background: #fff;
      box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);
    }

    .quota-card {
      padding: 1rem;
    }

    .quota-card span {
      display: block;
      color: #64748b;
      font-size: 0.85rem;
      font-weight: 700;
    }

    .quota-card strong {
      display: block;
      margin-top: 0.2rem;
      color: #1d4ed8;
      font-size: 1.5rem;
    }

    .simple-card {
      display: grid;
      gap: 0.85rem;
      padding: 1rem;
      margin-bottom: 1rem;
    }

    label {
      display: grid;
      gap: 0.35rem;
      color: #475569;
      font-weight: 700;
    }

    input,
    textarea {
      min-height: 42px;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      padding: 0.65rem 0.8rem;
      font: inherit;
    }

    textarea {
      min-height: 80px;
      resize: vertical;
    }

    button {
      width: max-content;
      min-height: 40px;
      border: 0;
      border-radius: 12px;
      padding: 0 1rem;
      background: #2563eb;
      color: #fff;
      font-weight: 800;
      cursor: pointer;
    }

    button:disabled {
      background: #94a3b8;
      cursor: not-allowed;
    }

    .soft-button {
      border: 1px solid #bfdbfe;
      background: #eff6ff;
      color: #1d4ed8;
    }

    .danger-button {
      border: 1px solid #fecaca;
      background: #fff7f7;
      color: #b91c1c;
    }

    .hint-box {
      padding: 0.75rem;
      border: 1px solid #bfdbfe;
      border-radius: 12px;
      background: #eff6ff;
      color: #1e40af;
      font-size: 0.9rem;
    }

    .message-text {
      color: #166534;
    }

    .error-text {
      color: #b91c1c;
    }

    .loading-box,
    .empty-row {
      color: #64748b;
      text-align: center;
      padding: 1.2rem;
    }

    .simple-table {
      width: 100%;
      border-collapse: collapse;
      overflow: hidden;
      background: #fff;
    }

    th,
    td {
      padding: 0.8rem;
      border-bottom: 1px solid #e2e8f0;
      text-align: left;
      vertical-align: top;
    }

    th {
      color: #475569;
      background: #f8fafc;
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    small {
      color: #64748b;
    }

    .status-pill {
      display: inline-flex;
      padding: 0.25rem 0.6rem;
      border-radius: 999px;
      background: #f1f5f9;
      color: #334155;
      font-weight: 800;
      font-size: 0.78rem;
    }

    .status-approved {
      background: #dcfce7;
      color: #166534;
    }

    .status-pending {
      background: #fef3c7;
      color: #92400e;
    }

    .status-rejected,
    .status-cancelled {
      background: #fee2e2;
      color: #991b1b;
    }

    @media (max-width: 760px) {
      .page-box,
      .quota-grid {
        grid-template-columns: 1fr;
        display: grid;
      }
    }
  `],
})
export class MyGatePassesComponent implements OnInit {
  gatePasses: any[] = [];
  monthlyLimitMinutes = 240;
  monthlyUsedMinutes = 0;
  monthlyRemainingMinutes = 240;
  loading = false;
  saving = false;
  message = '';
  error = '';

  model = {
    outTime: '',
    expectedInTime: '',
    reason: '',
    remarks: '',
  };

  constructor(private readonly api: SelfServiceApi) {}

  ngOnInit(): void {
    this.setDefaultTimes();
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';

    this.api.gatePasses().subscribe({
      next: (result) => {
        this.gatePasses = result?.data ?? [];
        this.monthlyLimitMinutes = result?.monthlyLimitMinutes ?? 240;
        this.monthlyUsedMinutes = result?.monthlyUsedMinutes ?? 0;
        this.monthlyRemainingMinutes =
          result?.monthlyRemainingMinutes ?? 240;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.error =
          error?.error?.message ??
          'Gate passes could not be loaded.';
      },
    });
  }

  apply(form: NgForm): void {
    if (form.invalid) {
      return;
    }

    this.saving = true;
    this.message = '';
    this.error = '';

    this.api.createGatePass({
      outTime: this.model.outTime,
      expectedInTime: this.model.expectedInTime,
      reason: this.model.reason,
      remarks: this.model.remarks,
    }).subscribe({
      next: () => {
        this.saving = false;
        this.message = 'Gate pass submitted for approval.';
        form.resetForm();
        this.setDefaultTimes();
        this.load();
      },
      error: (error) => {
        this.saving = false;
        this.error =
          error?.error?.message ??
          'Gate pass request failed.';
      },
    });
  }

  cancel(id: number): void {
    if (!confirm('Cancel this gate pass?')) {
      return;
    }

    this.message = '';
    this.error = '';

    this.api.cancelGatePass(id).subscribe({
      next: () => {
        this.message = 'Gate pass cancelled.';
        this.load();
      },
      error: (error) => {
        this.error =
          error?.error?.message ??
          'Gate pass could not be cancelled.';
      },
    });
  }

  requestedMinutes(item: any): number {
    if (!item?.outTime || !item?.expectedInTime) {
      return 0;
    }

    const outTime = new Date(item.outTime).getTime();
    const inTime = new Date(item.expectedInTime).getTime();

    return Math.max(0, Math.ceil((inTime - outTime) / 60000));
  }

  timeLabel(minutes: number): string {
    const safeMinutes = Math.max(0, minutes || 0);
    const hours = Math.floor(safeMinutes / 60);
    const mins = safeMinutes % 60;

    if (hours === 0) {
      return `${mins}m`;
    }

    if (mins === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${mins}m`;
  }

  canCancel(item: any): boolean {
    return !item?.actualOutTime &&
      !['Approved', 'Rejected', 'Cancelled']
        .includes(item?.status);
  }

  statusClass(status: string): string {
    return `status-${String(status || '').toLowerCase()}`;
  }

  private setDefaultTimes(): void {
    const outTime = new Date();
    const inTime = new Date(outTime.getTime() + 30 * 60000);

    this.model = {
      outTime: this.toInputDateTime(outTime),
      expectedInTime: this.toInputDateTime(inTime),
      reason: '',
      remarks: '',
    };
  }

  private toInputDateTime(value: Date): string {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    const hours = String(value.getHours()).padStart(2, '0');
    const minutes = String(value.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
}
