import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { API_ROUTES } from '../../../core/config/api.config';
import { AuthSessionService } from '../../../core/services/auth-session.service';

interface SalarySlip {
  empCode: string;
  employeeName: string;
  department: string;
  basic: number;
  allowances: number;
  deductions: number;
  netPay: number;
  absentDays: number;
  paidAnnualLeaveDays: number;
  sickHalfPayDays: number;
  sickUnpaidDays: number;
  unpaidLeaveDays: number;
  leaveDeductionDays: number;
}

interface PayrollRegisterResponse {
  payrollID: number;
  status: string;
  rows: PayrollRegisterRow[];
}

interface PayrollRegisterRow {
  empCode: string;
  firstName: string;
  lastName: string;
  departmentName: string;
  basicSalary: number;
  allowance: number;
  deduction: number;
  netSalary: number;
  absentDays: number;
  paidAnnualLeaveDays: number;
  sickHalfPayDays: number;
  sickUnpaidDays: number;
  unpaidLeaveDays: number;
  leaveDeductionDays: number;
}

@Component({
  selector: 'app-payroll',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatTableModule, MatPaginatorModule, MatIconModule, MatProgressBarModule, MatChipsModule, MatDialogModule],
  templateUrl: './payroll.component.html',
  styleUrls: ['./payroll.component.scss'],
})
export class PayrollComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly authSession = inject(AuthSessionService);

  months = [
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

  years = [2024, 2025, 2026, 2027];
  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();
  isRunning = false;
  message = '';
  salarySlips: SalarySlip[] = [];

  displayedColumns = [
    'employeeName',
    'department',
    'basic',
    'paidLeave',
    'deductionDays',
    'deductions',
    'netPay',
    'status',
    'actions'
  ];

  ngOnInit(): void {
    this.loadPayrollRegister();
  }

  runPayroll(): void {
    this.isRunning = true;
    this.message = 'Running payroll...';

    this.http.post<any>(API_ROUTES.payrollRun, {
      compID: this.authSession.companyId,
      month: this.selectedMonth,
      year: this.selectedYear,
    }).subscribe({
      next: (result) => {
        this.message = result?.alreadyExists
          ? 'Payroll refreshed for this month.'
          : 'Payroll generated successfully.';
        this.loadPayrollRegister();
      },
      error: (err) => {
        this.isRunning = false;
        this.message = err?.error?.message ?? err?.error ?? 'Payroll failed.';
      },
    });
  }

  loadPayrollRegister(): void {
    const params = {
      month: this.selectedMonth,
      year: this.selectedYear,
    };

    this.http.get<PayrollRegisterResponse>(
      API_ROUTES.payrollRegister,
      { params: params as any }
    ).subscribe({
      next: (result) => {
        this.isRunning = false;
        this.salarySlips = (result.rows ?? []).map((row) => ({
          empCode: row.empCode,
          employeeName: `${row.firstName} ${row.lastName}`.trim(),
          department: row.departmentName || '-',
          basic: row.basicSalary,
          allowances: row.allowance,
          deductions: row.deduction,
          netPay: row.netSalary,
          absentDays: row.absentDays ?? 0,
          paidAnnualLeaveDays: row.paidAnnualLeaveDays ?? 0,
          sickHalfPayDays: row.sickHalfPayDays ?? 0,
          sickUnpaidDays: row.sickUnpaidDays ?? 0,
          unpaidLeaveDays: row.unpaidLeaveDays ?? 0,
          leaveDeductionDays: row.leaveDeductionDays ?? 0,
        }));
      },
      error: () => {
        this.isRunning = false;
        this.message = 'Could not load payroll register.';
      },
    });
  }

  viewSlip(slip: SalarySlip): void {
    this.message = `${slip.employeeName}: Net salary ${slip.netPay.toFixed(2)}`;
  }

  downloadSlip(slip: SalarySlip): void {
    const lines = [
      'Salary Slip',
      `Employee: ${slip.employeeName}`,
      `Code: ${slip.empCode}`,
      `Basic: ${slip.basic.toFixed(2)}`,
      `Allowances: ${slip.allowances.toFixed(2)}`,
      `Paid annual leave days: ${slip.paidAnnualLeaveDays}`,
      `Absent days: ${slip.absentDays}`,
      `Leave deduction days: ${slip.leaveDeductionDays}`,
      `Deductions: ${slip.deductions.toFixed(2)}`,
      `Net Pay: ${slip.netPay.toFixed(2)}`,
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `salary-slip-${slip.empCode}-${this.selectedYear}-${this.selectedMonth}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  sendPayslip(): void {
    this.message = 'Payslip sending is not enabled yet.';
  }
}
