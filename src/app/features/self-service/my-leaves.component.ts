import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { LeaveType, SelfServiceApi } from './self-service.api';

@Component({
  selector: 'app-my-leaves',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-box">
      <h1>My Leaves</h1>
      <p>Check balance, apply leave, and track approval status.</p>
    </div>

    <section class="balance-grid">
      <div *ngFor="let balance of balances" class="balance-card">
        <strong>{{ balance.leaveName }}</strong><br>
        Remaining: {{ balance.remaining }} / {{ balance.entitled }}<br>
        Used: {{ balance.used }}
      </div>
    </section>

    <form #leaveForm="ngForm" (ngSubmit)="apply(leaveForm)" class="simple-card">
      <h2>Apply for leave</h2>
      <label>Leave type
        <select name="leaveTypeID" [(ngModel)]="model.leaveTypeID" required>
          <option [ngValue]="null">Select</option>
          <option *ngFor="let type of types" [ngValue]="type.leaveTypeID">{{ type.leaveName }}</option>
        </select>
      </label>
      <label>Start date <input type="date" name="startDate" [(ngModel)]="model.startDate" required></label>
      <label>End date <input type="date" name="endDate" [(ngModel)]="model.endDate" required></label>
      <label><input type="checkbox" name="isHalfDay" [(ngModel)]="model.isHalfDay"> Half day</label>
      <label>Reason <textarea name="reason" [(ngModel)]="model.reason" maxlength="500"></textarea></label>
      <button type="submit" [disabled]="leaveForm.invalid || saving">{{ saving ? 'Submitting...' : 'Submit' }}</button>
    </form>

    <p *ngIf="message">{{ message }}</p>
    <p *ngIf="error" class="error-text">{{ error }}</p>

    <table class="simple-table">
      <thead><tr><th>Type</th><th>Dates</th><th>Days</th><th>Status</th><th></th></tr></thead>
      <tbody>
        <tr *ngFor="let item of leaves">
          <td>{{ item.leaveName }}</td>
          <td>{{ item.startDate | date:'mediumDate' }} - {{ item.endDate | date:'mediumDate' }}</td>
          <td>{{ item.isHalfDay ? 0.5 : item.totalDays }}</td>
          <td>{{ item.status }}</td>
          <td><button *ngIf="canCancel(item.status)" type="button" (click)="cancel(item.leaveID)">Cancel</button></td>
        </tr>
      </tbody>
    </table>
  `,
  styles: [`
    .page-box{margin-bottom:18px}
    .page-box p{color:#64748b}
    .balance-grid{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:24px}
    .balance-card,.simple-card{padding:16px;border:1px solid #e5e7eb;border-radius:12px;background:#fff}
    .balance-card{min-width:170px}
    .simple-card{display:grid;gap:12px;max-width:620px;margin-bottom:28px}
    label{display:grid;gap:6px;font-weight:600}
    input,select,textarea{padding:10px;border:1px solid #cbd5e1;border-radius:8px}
    button{width:max-content;padding:10px 16px;border:0;border-radius:8px;background:#2563eb;color:#fff}
    button:disabled{background:#94a3b8}
    .simple-table{width:100%;border-collapse:collapse;background:#fff}
    th,td{border-bottom:1px solid #e5e7eb;padding:10px;text-align:left}
    .error-text{color:#b00020}
  `],
})
export class MyLeavesComponent implements OnInit {
  types: LeaveType[] = [];
  balances: any[] = [];
  leaves: any[] = [];
  saving = false;
  error = '';
  message = '';

  model: {
    leaveTypeID: number | null;
    startDate: string;
    endDate: string;
    isHalfDay: boolean;
    reason: string;
  } = {
    leaveTypeID: null,
    startDate: '',
    endDate: '',
    isHalfDay: false,
    reason: '',
  };

  constructor(private readonly api: SelfServiceApi) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    forkJoin({
      types: this.api.leaveTypes(),
      balances: this.api.leaveBalances(),
      leaves: this.api.leaves(),
    }).subscribe({
      next: (data) => {
        this.types = data.types;
        this.balances = data.balances;
        this.leaves = data.leaves;
      },
      error: (error) => this.error = error?.error?.message ?? 'Leave data could not be loaded.',
    });
  }

  apply(form: NgForm): void {
    if (form.invalid || this.model.leaveTypeID === null) return;
    this.saving = true;
    this.error = '';
    this.message = '';
    this.api.createLeave(this.model).subscribe({
      next: () => {
        this.saving = false;
        this.message = 'Leave request submitted.';
        form.resetForm({ leaveTypeID: null, startDate: '', endDate: '', isHalfDay: false, reason: '' });
        this.load();
      },
      error: (error) => {
        this.saving = false;
        this.error = error?.error?.message ?? 'Leave request failed.';
      },
    });
  }

  cancel(id: number): void {
    this.api.cancelLeave(id).subscribe({
      next: () => this.load(),
      error: (error) => this.error = error?.error?.message ?? 'Leave could not be cancelled.',
    });
  }

  canCancel(status: string): boolean {
    return !['Approved', 'Rejected', 'Cancelled'].includes(status);
  }
}
