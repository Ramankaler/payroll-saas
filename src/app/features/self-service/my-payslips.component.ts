import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SelfServiceApi } from './self-service.api';

@Component({
  selector: 'app-my-payslips',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-box">
      <h1>My Salary Slips</h1>
      <p>View and download your generated salary slips.</p>
    </div>

    <p *ngIf="error" class="error-text">{{ error }}</p>

    <table class="simple-table">
      <thead><tr><th>Period</th><th>Basic</th><th>Allowance</th><th>Advance</th><th>Manual</th><th>Deduction</th><th>Net</th><th></th></tr></thead>
      <tbody><tr *ngFor="let item of rows">
        <td>{{ item.month }}/{{ item.year }}</td><td>{{ item.basicSalary }}</td><td>{{ item.allowance }}</td><td>{{ item.advanceDeduction }}</td><td>{{ item.manualDeduction }}</td><td>{{ item.deduction }}</td><td>{{ item.netSalary }}</td>
        <td><button type="button" (click)="download(item)">Download</button></td>
      </tr></tbody>
    </table>
    <p *ngIf="!rows.length && !error" class="muted">No salary slips found.</p>
  `,
  styles: [`
    .page-box{margin-bottom:18px}
    .page-box p,.muted{color:#64748b}
    .simple-table{width:100%;border-collapse:collapse;background:#fff}
    th,td{border-bottom:1px solid #e5e7eb;padding:10px;text-align:left}
    button{padding:8px 12px;border:0;border-radius:8px;background:#2563eb;color:#fff}
    .error-text{color:#b00020}
  `],
})
export class MyPayslipsComponent implements OnInit {
  rows: any[] = [];
  error = '';
  constructor(private readonly api: SelfServiceApi) {}
  ngOnInit(): void {
    this.api.payslips().subscribe({
      next: (rows) => this.rows = rows,
      error: (error) => this.error = error?.error?.message ?? 'Salary slips could not be loaded.',
    });
  }
  download(item: any): void {
    this.api.downloadPayslip(item.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `salary-slip-${item.year}-${String(item.month).padStart(2, '0')}.html`;
        link.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.error = 'Salary slip download failed.',
    });
  }
}
