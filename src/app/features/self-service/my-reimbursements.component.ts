import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { SelfServiceApi } from './self-service.api';

@Component({
  selector: 'app-my-reimbursements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-box">
      <h1>My Reimbursements</h1>
      <p class="muted">Submit expense claims with receipt copy.</p>
    </div>

    <form #form="ngForm" (ngSubmit)="submit(form)" class="simple-card">
      <label>Amount
        <input type="number" name="amount" [(ngModel)]="model.amount" min="0.01" step="0.01" required>
      </label>
      <label>Category
        <input type="text" name="category" [(ngModel)]="model.category" maxlength="100" required>
      </label>
      <label>Description
        <textarea name="description" [(ngModel)]="model.description" maxlength="500" required></textarea>
      </label>
      <label>Receipt
        <input type="file" name="billFile" accept=".jpg,.jpeg,.png,.webp,.pdf" (change)="onFileChange($event)" required>
      </label>
      <button type="submit" [disabled]="form.invalid || saving || !model.billFile">
        {{ saving ? 'Submitting...' : 'Submit Claim' }}
      </button>
    </form>

    <p *ngIf="error" class="error-text">{{ error }}</p>

    <table class="simple-table">
      <thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th><th>Status</th></tr></thead>
      <tbody><tr *ngFor="let item of rows">
        <td>{{ item.createdAt | date:'mediumDate' }}</td><td>{{ item.category }}</td><td>{{ item.description }}</td><td>{{ item.amount }}</td><td>{{ item.status }}</td>
      </tr></tbody>
    </table>
    <p *ngIf="!rows.length && !error" class="muted">No reimbursements yet.</p>
  `,
  styles: [`
    .page-box{margin-bottom:18px}
    .muted{color:#64748b}
    .simple-card{display:grid;gap:12px;max-width:620px;margin-bottom:28px;padding:18px;border:1px solid #e5e7eb;border-radius:12px;background:#fff}
    label{display:grid;gap:6px;font-weight:600}
    input,textarea{padding:10px;border:1px solid #cbd5e1;border-radius:8px}
    button{width:max-content;padding:10px 16px;border:0;border-radius:8px;background:#2563eb;color:#fff}
    button:disabled{background:#94a3b8}
    .simple-table{width:100%;border-collapse:collapse;background:#fff}
    th,td{border-bottom:1px solid #e5e7eb;padding:10px;text-align:left}
    .error-text{color:#b00020}
  `],
})
export class MyReimbursementsComponent implements OnInit {
  rows: any[] = [];
  saving = false;
  error = '';
  model = {
    amount: null as number | null,
    category: '',
    description: '',
    billFile: null as File | null,
  };

  constructor(private readonly api: SelfServiceApi) {}
  ngOnInit(): void { this.load(); }

  load(): void {
    this.api.reimbursements().subscribe({
      next: (rows) => this.rows = rows,
      error: (error) => this.error = error?.error?.message ?? 'Reimbursements could not be loaded.',
    });
  }

  submit(form: NgForm): void {
    if (
      form.invalid ||
      this.model.amount === null ||
      !this.model.billFile
    ) {
      return;
    }

    const formData = new FormData();
    formData.append('amount', String(this.model.amount));
    formData.append('category', this.model.category);
    formData.append('description', this.model.description);
    formData.append('billFile', this.model.billFile);

    this.saving = true;
    this.api.createReimbursement(formData).subscribe({
      next: () => {
        this.saving = false;
        form.resetForm({
          amount: null,
          category: '',
          description: '',
          billFile: null,
        });
        this.model.billFile = null;
        this.load();
      },
      error: (error) => {
        this.saving = false;
        this.error = error?.error?.message ?? 'Reimbursement request failed.';
      },
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.model.billFile = input.files?.[0] ?? null;
  }
}
