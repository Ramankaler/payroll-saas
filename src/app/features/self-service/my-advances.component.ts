import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelfServiceApi } from './self-service.api';

@Component({
  selector: 'app-my-advances',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="self-page">
      <div class="card">
        <h1>My Advances</h1>
        <p>Request salary advance and track deductions.</p>

        <div class="form-grid">
          <label>
            Amount
            <input type="number" [(ngModel)]="req.Amount" />
          </label>

          <label>
            Deduct % Per Month
            <input type="number" [(ngModel)]="req.DeductPercent" />
          </label>
        </div>

        <label>
          Reason
          <textarea rows="3" [(ngModel)]="req.Reason"></textarea>
        </label>

        <button type="button" class="btn primary" (click)="save()">Submit Request</button>
        <p class="msg" *ngIf="message">{{ message }}</p>
      </div>

      <div class="card">
        <h2>My Advance History</h2>
        <p *ngIf="loading">Loading...</p>

        <div class="row" *ngFor="let item of rows">
          <div>
            <strong>{{ item.amount | number:'1.2-2' }}</strong>
            <span>{{ item.reason }}</span>
          </div>
          <div>
            <span class="pill">{{ item.status }}</span>
            <small>Balance: {{ item.balance | number:'1.2-2' }}</small>
          </div>
          <button
            type="button"
            class="btn light"
            *ngIf="item.status === 'Pending'"
            (click)="cancel(item.advanceID)"
          >
            Cancel
          </button>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .self-page { display: grid; gap: 1rem; }
    .card { background: #fff; border: 1px solid #e5e7eb; border-radius: 18px; padding: 1rem; box-shadow: 0 12px 30px rgba(15,23,42,.06); }
    h1, h2, p { margin-top: 0; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    label { display: grid; gap: .35rem; font-weight: 600; }
    input, textarea { border: 1px solid #cbd5e1; border-radius: 12px; padding: .65rem .75rem; }
    .btn { border: 0; border-radius: 999px; padding: .55rem .9rem; cursor: pointer; margin-top: .75rem; }
    .primary { background: #2563eb; color: #fff; }
    .light { background: #f1f5f9; color: #334155; }
    .row { display: grid; grid-template-columns: 1fr auto auto; align-items: center; gap: 1rem; padding: .8rem 0; border-bottom: 1px solid #e5e7eb; }
    .row span, .row small { display: block; color: #64748b; }
    .pill { background: #eef2ff; color: #3730a3 !important; padding: .25rem .55rem; border-radius: 999px; }
    .msg { color: #2563eb; margin-top: .75rem; }
    @media (max-width: 800px) { .form-grid, .row { grid-template-columns: 1fr; } }
  `],
})
export class MyAdvancesComponent implements OnInit {
  private readonly api = inject(SelfServiceApi);

  rows: any[] = [];
  loading = false;
  message = '';
  req = {
    Amount: 0,
    DeductPercent: 10,
    Reason: '',
  };

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.api.advances().subscribe({
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

  save(): void {
    this.api.createAdvance(this.req).subscribe({
      next: () => {
        this.message = 'Advance request submitted.';
        this.req = { Amount: 0, DeductPercent: 10, Reason: '' };
        this.load();
      },
      error: err => this.message = err?.error?.message ?? 'Request failed.',
    });
  }

  cancel(id: number): void {
    this.api.cancelAdvance(id).subscribe({
      next: () => this.load(),
      error: err => this.message = err?.error?.message ?? 'Cancel failed.',
    });
  }
}
