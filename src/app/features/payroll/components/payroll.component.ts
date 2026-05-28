import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';

interface SalarySlip {
  id: string;
  employeeName: string;
  department: string;
  basic: number;
  allowances: number;
  deductions: number;
  netPay: number;
  period: string;
  status: 'Generated' | 'Paid';
}

@Component({
  selector: 'app-payroll',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatTableModule, MatPaginatorModule, MatIconModule, MatProgressBarModule, MatChipsModule, MatDialogModule],
  templateUrl: './payroll.component.html',
  styleUrls: ['./payroll.component.scss'],
})
export class PayrollComponent {
  selectedMonth = 'January';
  selectedYear = 2024;
  isRunning = false;

  salarySlips: SalarySlip[] = [
    { id: 'SAL-001', employeeName: 'John Doe', department: 'Engineering', basic: 5000, allowances: 1000, deductions: 500, netPay: 5500, period: 'Jan 2024', status: 'Generated' },
    { id: 'SAL-002', employeeName: 'Sarah Wilson', department: 'HR', basic: 4800, allowances: 800, deductions: 400, netPay: 5200, period: 'Jan 2024', status: 'Paid' },
    { id: 'SAL-003', employeeName: 'Mike Johnson', department: 'Sales', basic: 4200, allowances: 1200, deductions: 450, netPay: 4950, period: 'Jan 2024', status: 'Generated' },
  ];

  displayedColumns = ['employeeName', 'department', 'basic', 'allowances', 'deductions', 'netPay', 'status', 'actions'];

  runPayroll(): void {
    this.isRunning = true;
    setTimeout(() => {
      this.isRunning = false;
      this.salarySlips.push({
        id: 'SAL-004',
        employeeName: 'New Employee',
        department: 'Marketing',
        basic: 4000,
        allowances: 600,
        deductions: 350,
        netPay: 4250,
        period: 'Jan 2024',
        status: 'Generated',
      });
    }, 2000);
  }

  viewSlip(slip: SalarySlip): void {
    console.log('Viewing slip:', slip);
  }

  downloadSlip(id: string): void {
    console.log('Downloading slip:', id);
  }

  sendPayslip(slip: SalarySlip): void {
    slip.status = 'Paid';
  }
}
