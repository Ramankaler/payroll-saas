import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { API_ROUTES } from '../../../core/config/api.config';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

interface AttendanceReport {
  daysInMonth: number;
  rows: AttendanceRow[];
}

interface AttendanceRow {
  empCode: string;
  firstName: string;
  lastName: string;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  totalHours: number;
  days: { day: number; status: string }[];
}

interface ReportItem {
  key: string;
  name: string;
  note: string;
  icon: string;
}

interface ReportGroup {
  name: string;
  icon: string;
  reports: ReportItem[];
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
})
export class ReportsComponent {
  private readonly http = inject(HttpClient);

  reportGroups: ReportGroup[] = [
    {
      name: 'Employee Reports',
      icon: 'groups',
      reports: [
        {
          key: 'employee-master',
          name: 'Employee Master',
          note: 'Complete employee list with department, designation, status, and salary.',
          icon: 'badge',
        },
        {
          key: 'employee-statistics',
          name: 'Employee Statistics',
          note: 'Headcount, active/inactive employees, missing bio IDs, and setup gaps.',
          icon: 'query_stats',
        },
        {
          key: 'probation',
          name: 'Probation Status',
          note: 'Employees under probation and days remaining.',
          icon: 'hourglass_top',
        },
        {
          key: 'resignation-register',
          name: 'Resignation Register',
          note: 'Resignation date, last working date, inactive date, and status.',
          icon: 'person_remove',
        },
      ],
    },
    {
      name: 'Leave Reports',
      icon: 'event',
      reports: [
        {
          key: 'leave-register',
          name: 'Leave Register',
          note: 'Month-wise leave requests and approval status.',
          icon: 'event_note',
        },
        {
          key: 'leave-balance',
          name: 'Annual Leave Balance',
          note: 'UAE annual leave entitlement, used days, and available balance.',
          icon: 'beach_access',
        },
        {
          key: 'leave-statistics',
          name: 'Leave Statistics',
          note: 'Pending, approved, rejected, cancelled, and total leave days.',
          icon: 'analytics',
        },
      ],
    },
    {
      name: 'Document Reports',
      icon: 'folder_open',
      reports: [
        {
          key: 'document-expiry',
          name: 'Document Expiry',
          note: 'Passport, visa, Emirates ID, labour card, and other expiry tracking.',
          icon: 'assignment_late',
        },
      ],
    },
    {
      name: 'Payroll Reports',
      icon: 'payments',
      reports: [
        {
          key: 'payroll-register',
          name: 'Payroll Register',
          note: 'Employee salary, allowance, deduction, and net salary for selected month.',
          icon: 'receipt_long',
        },
        {
          key: 'payroll-statistics',
          name: 'Payroll Statistics',
          note: 'Gross salary, deductions, net salary, and payroll run status.',
          icon: 'bar_chart',
        },
        {
          key: 'advance-register',
          name: 'Advance Register',
          note: 'Salary advance amount, paid amount, balance, and approval status.',
          icon: 'savings',
        },
        {
          key: 'gratuity',
          name: 'Gratuity Estimate',
          note: 'UAE gratuity estimate based on basic salary and service period.',
          icon: 'account_balance_wallet',
        },
        {
          key: 'wps-readiness',
          name: 'WPS Readiness',
          note: 'Shows employees missing salary, bank, or payment setup before WPS/SIF export.',
          icon: 'fact_check',
        },
      ],
    },
    {
      name: 'Attendance Reports',
      icon: 'schedule',
      reports: [
        {
          key: 'monthly-attendance',
          name: 'Monthly Attendance',
          note: 'Employee-wise monthly calendar with present, absent, late, and hours.',
          icon: 'calendar_month',
        },
        {
          key: 'unmapped-punches',
          name: 'Unmapped Punches',
          note: 'Device punches whose biometric ID is not mapped to any employee.',
          icon: 'fingerprint',
        },
        {
          key: 'gatepass-register',
          name: 'Gate Pass Register',
          note: 'Employee out-pass requests with planned, actual, and approval status.',
          icon: 'meeting_room',
        },
      ],
    },
    {
      name: 'Reimbursement Reports',
      icon: 'receipt',
      reports: [
        {
          key: 'reimbursement-register',
          name: 'Reimbursement Register',
          note: 'Expense claim list with employee, amount, category, and status.',
          icon: 'request_quote',
        },
      ],
    },
    {
      name: 'Asset Reports',
      icon: 'inventory_2',
      reports: [
        {
          key: 'asset-summary',
          name: 'Asset Summary',
          note: 'Total assets, allocated assets, available assets, and total asset value.',
          icon: 'summarize',
        },
        {
          key: 'asset-register',
          name: 'Asset Register',
          note: 'Full company asset list with code, serial, branch, condition, and status.',
          icon: 'category',
        },
        {
          key: 'asset-allocation',
          name: 'Asset Allocation',
          note: 'Issued and returned asset history employee-wise.',
          icon: 'assignment_ind',
        },
      ],
    },
    {
      name: 'Accounts Reports',
      icon: 'account_balance',
      reports: [
        {
          key: 'trial-balance',
          name: 'Trial Balance',
          note: 'Debit, credit, and balance review for posted journals.',
          icon: 'balance',
        },
        {
          key: 'profit-loss',
          name: 'Profit & Loss',
          note: 'Income and expense summary for selected period.',
          icon: 'monitoring',
        },
        {
          key: 'balance-sheet',
          name: 'Balance Sheet',
          note: 'Assets, liabilities, and equity as of selected date.',
          icon: 'account_balance',
        },
        {
          key: 'vat-summary',
          name: 'VAT Summary',
          note: 'Input VAT, output VAT, and net VAT payable.',
          icon: 'receipt_long',
        },
      ],
    },
  ];

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
  activeGroupName = 'Employee Reports';
  selectedReport = 'employee-master';
  reportSearch = '';
  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();
  rowLimit = 5000;
  rowLimitOptions = [1000, 5000, 10000, 20000];
  loading = false;
  message = '';
  attendanceDays: number[] = [];
  attendanceRows: AttendanceRow[] = [];
  rows: any[] = [];
  columns: string[] = [];
  readonly reportEngineNote = 'Live API';

  get reports(): ReportItem[] {
    return this.reportGroups.flatMap(group => group.reports);
  }

  get activeGroup(): ReportGroup {
    return this.reportGroups.find(group => group.name === this.activeGroupName)
      ?? this.reportGroups[0];
  }

  get filteredActiveReports(): ReportItem[] {
    const searchText = this.reportSearch.trim().toLowerCase();

    if (!searchText) {
      return this.activeGroup.reports;
    }

    return this.activeGroup.reports.filter(report =>
      report.name.toLowerCase().includes(searchText) ||
      report.note.toLowerCase().includes(searchText)
    );
  }

  get totalReports(): number {
    return this.reports.length;
  }

  get selectedReportInfo(): ReportItem | undefined {
    return this.reports.find(report => report.key === this.selectedReport);
  }

  get selectedReportName(): string {
    return this.getReportName(this.selectedReport);
  }

  selectGroup(group: ReportGroup): void {
    this.activeGroupName = group.name;

    if (group.reports.length > 0) {
      this.selectedReport = group.reports[0].key;
      this.reportSearch = '';
      this.clearPreview();
    }
  }

  selectReport(reportKey: string): void {
    this.selectedReport = reportKey;
    this.clearPreview();
  }

  isActiveReport(reportKey: string): boolean {
    return this.selectedReport === reportKey;
  }

  trackByGroupName(_index: number, group: ReportGroup): string {
    return group.name;
  }

  trackByReportKey(_index: number, report: ReportItem): string {
    return report.key;
  }

  trackByColumn(_index: number, column: string): string {
    return column;
  }

  trackByDay(_index: number, day: number): number {
    return day;
  }

  trackByAttendanceCell(_index: number, day: { day: number }): number {
    return day.day;
  }

  trackByReportRow(index: number, row: any): string {
    return String(
      row.empID ??
        row.empCode ??
        row.leaveID ??
        row.rawPunchID ??
        row.reimbID ??
        row.gatePassID ??
        row.assetCode ??
        row.accountCode ??
        index
    );
  }

  load(): void {
    this.loadReport(this.selectedReport);
  }

  viewReport(reportKey: string): void {
    this.loadReport(reportKey);
  }

  downloadCsv(reportKey: string): void {
    this.loadReport(reportKey, () => this.exportCsv());
  }

  downloadExcel(reportKey: string): void {
    this.loadReport(reportKey, () => this.exportExcel());
  }

  downloadPdf(reportKey: string): void {
    this.loadReport(reportKey, () => this.exportPdf());
  }

  exportCsv(): void {
    const report = this.buildExportData();

    if (report.rows.length === 0) {
      this.message = 'Load a report before exporting.';
      return;
    }

    const lines = [
      report.columns.map(value => this.csvValue(value)).join(','),
      ...report.rows.map(row =>
        report.columns
          .map(column => this.csvValue(row[column]))
          .join(',')
      ),
    ];

    this.downloadBlob(
      lines.join('\n'),
      'text/csv;charset=utf-8',
      `${this.fileName()}.csv`
    );
  }

  exportExcel(): void {
    const report = this.buildExportData();

    if (report.rows.length === 0) {
      this.message = 'Load a report before exporting.';
      return;
    }

    const tableRows = report.rows
      .map(row =>
        `<tr>${report.columns
          .map(column => `<td>${this.htmlValue(row[column])}</td>`)
          .join('')}</tr>`
      )
      .join('');

    const html = `
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #d0d7de; padding: 6px; }
            th { background: #f3f4f6; font-weight: bold; }
          </style>
        </head>
        <body>
          <h2>${this.htmlValue(this.selectedReportName)}</h2>
          <p>Period: ${this.selectedMonth}/${this.selectedYear}</p>
          <table>
            <thead>
              <tr>${report.columns.map(column => `<th>${this.htmlValue(column)}</th>`).join('')}</tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        </body>
      </html>`;

    this.downloadBlob(
      html,
      'application/vnd.ms-excel;charset=utf-8',
      `${this.fileName()}.xls`
    );
  }

  exportPdf(): void {
    const report = this.buildExportData();

    if (report.rows.length === 0) {
      this.message = 'Load a report before exporting.';
      return;
    }

    const tableRows = report.rows
      .map(row =>
        `<tr>${report.columns
          .map(column => `<td>${this.htmlValue(row[column])}</td>`)
          .join('')}</tr>`
      )
      .join('');

    const html = `
      <html>
        <head>
          <title>${this.htmlValue(this.selectedReportName)}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              color: #111827;
              padding: 24px;
            }
            .header {
              border-bottom: 2px solid #2563eb;
              margin-bottom: 16px;
              padding-bottom: 12px;
            }
            h1 { margin: 0; font-size: 22px; }
            p { margin: 6px 0 0; color: #4b5563; }
            table {
              border-collapse: collapse;
              width: 100%;
              font-size: 11px;
            }
            th, td {
              border: 1px solid #d0d7de;
              padding: 6px;
              text-align: left;
              vertical-align: top;
            }
            th {
              background: #eff6ff;
              color: #1e3a8a;
            }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <button onclick="window.print()">Print / Save as PDF</button>
          <div class="header">
            <h1>${this.htmlValue(this.selectedReportName)}</h1>
            <p>Period: ${this.selectedMonth}/${this.selectedYear}</p>
            <p>Generated: ${new Date().toLocaleString()}</p>
          </div>
          <table>
            <thead>
              <tr>${report.columns.map(column => `<th>${this.htmlValue(column)}</th>`).join('')}</tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        </body>
      </html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const popup = window.open(url, '_blank');

    if (!popup) {
      URL.revokeObjectURL(url);
      this.message = 'Popup blocked. Please allow popups for PDF print.';
      return;
    }

    setTimeout(() => {
      popup.print();
      URL.revokeObjectURL(url);
    }, 500);
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  private loadReport(reportKey: string, afterLoad?: () => void): void {
    this.selectedReport = reportKey;
    this.loading = true;
    this.message = '';
    this.attendanceDays = [];
    this.attendanceRows = [];
    this.rows = [];
    this.columns = [];

    const params = {
      month: this.selectedMonth,
      year: this.selectedYear,
      limit: this.rowLimit,
      from: this.reportFromDate(),
      to: this.reportToDate(),
    };

    this.http.get<any>(this.getReportUrl(reportKey), { params: params as any }).subscribe({
      next: result => {
        this.loading = false;

        if (reportKey === 'monthly-attendance') {
          const report = result as AttendanceReport;
          this.attendanceDays = Array.from(
            { length: report.daysInMonth },
            (_, index) => index + 1
          );
          this.attendanceRows = report.rows ?? [];
        } else {
          this.rows = Array.isArray(result) ? result : result.rows ?? [];
          this.columns = this.rows.length > 0 ? Object.keys(this.rows[0]) : [];
        }

        if (afterLoad) {
          afterLoad();
        }
      },
      error: err => {
        this.loading = false;
        this.message = err?.error?.message ?? err?.error ?? 'Report failed.';
      },
    });
  }

  private clearPreview(): void {
    this.message = '';
    this.attendanceDays = [];
    this.attendanceRows = [];
    this.rows = [];
    this.columns = [];
  }

  private getReportUrl(reportKey: string): string {
    switch (reportKey) {
      case 'payroll-register':
        return API_ROUTES.reportsPayrollRegister;
      case 'unmapped-punches':
        return API_ROUTES.reportsUnmappedPunches;
      case 'gatepass-register':
        return API_ROUTES.reportsGatePass;
      case 'payroll-statistics':
        return API_ROUTES.reportsPayrollStatistics;
      case 'wps-readiness':
        return API_ROUTES.reportsWpsReadiness;
      case 'employee-master':
        return API_ROUTES.reportsEmployeeMaster;
      case 'employee-statistics':
        return API_ROUTES.reportsEmployeeStatistics;
      case 'document-expiry':
        return API_ROUTES.reportsDocumentExpiry;
      case 'leave-register':
        return API_ROUTES.reportsLeaveRegister;
      case 'leave-statistics':
        return API_ROUTES.reportsLeaveStatistics;
      case 'reimbursement-register':
        return API_ROUTES.reportsReimbursementRegister;
      case 'advance-register':
        return API_ROUTES.reportsAdvanceRegister;
      case 'resignation-register':
        return API_ROUTES.reportsResignationRegister;
      case 'leave-balance':
        return API_ROUTES.reportsLeaveBalance;
      case 'gratuity':
        return API_ROUTES.reportsGratuity;
      case 'probation':
        return API_ROUTES.reportsProbation;
      case 'asset-register':
        return API_ROUTES.reportsAssetRegister;
      case 'asset-allocation':
        return API_ROUTES.reportsAssetAllocation;
      case 'asset-summary':
        return API_ROUTES.reportsAssetSummary;
      case 'trial-balance':
        return API_ROUTES.reportsTrialBalance;
      case 'profit-loss':
        return API_ROUTES.reportsProfitLoss;
      case 'balance-sheet':
        return API_ROUTES.reportsBalanceSheet;
      case 'vat-summary':
        return API_ROUTES.reportsVatSummary;
      default:
        return API_ROUTES.reportsMonthlyAttendance;
    }
  }

  private reportFromDate(): string {
    return `${this.selectedYear}-${String(this.selectedMonth).padStart(2, '0')}-01`;
  }

  private reportToDate(): string {
    const lastDay = new Date(
      this.selectedYear,
      this.selectedMonth,
      0
    ).getDate();

    return `${this.selectedYear}-${String(this.selectedMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  }

  private buildExportData(): { columns: string[]; rows: any[] } {
    if (this.selectedReport === 'monthly-attendance') {
      const columns = [
        'Emp Code',
        'Name',
        'Present',
        'Absent',
        'Late',
        'Hours',
        ...this.attendanceDays.map(day => `Day ${day}`),
      ];

      const rows = this.attendanceRows.map(row => {
        const item: any = {
          'Emp Code': row.empCode,
          Name: `${row.firstName} ${row.lastName}`.trim(),
          Present: row.presentDays,
          Absent: row.absentDays,
          Late: row.lateDays,
          Hours: row.totalHours,
        };

        row.days.forEach(day => {
          item[`Day ${day.day}`] = day.status;
        });

        return item;
      });

      return { columns, rows };
    }

    return {
      columns: this.columns,
      rows: this.rows,
    };
  }

  private getReportName(reportKey: string): string {
    return this.reports.find(report => report.key === reportKey)?.name ?? reportKey;
  }

  private fileName(): string {
    return `${this.selectedReport}-${this.selectedYear}-${String(this.selectedMonth).padStart(2, '0')}`;
  }

  private downloadBlob(content: string, type: string, fileName: string): void {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  private csvValue(value: any): string {
    return `"${this.exportText(value).replace(/"/g, '""')}"`;
  }

  private htmlValue(value: any): string {
    return this.exportText(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private exportText(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    const text = String(value);
    const trimmedText = text.trimStart();
    const firstLetter = trimmedText.charAt(0);

    if (['=', '+', '-', '@'].includes(firstLetter)) {
      return `'${text}`;
    }

    return text;
  }
}
