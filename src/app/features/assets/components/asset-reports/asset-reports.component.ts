import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../../../core/config/api.config';

@Component({
  selector: 'app-asset-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './asset-reports.component.html',
})
export class AssetReportsComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly reportUrl = `${API_BASE_URL}/api/assets/reports`;

  reports = [
    { key: 'asset-summary', name: 'Asset Summary' },
    { key: 'asset-register', name: 'Asset Register' },
    { key: 'asset-allocation', name: 'Asset Allocation' },
  ];

  selectedReport = 'asset-summary';
  loading = false;
  message = '';
  rows: any[] = [];
  columns: string[] = [];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.message = '';
    this.rows = [];
    this.columns = [];

    this.http.get<any[]>(`${this.reportUrl}/${this.selectedReport}`).subscribe({
      next: result => {
        this.loading = false;
        this.rows = Array.isArray(result) ? result : [];
        this.columns = this.rows.length ? Object.keys(this.rows[0]) : [];
      },
      error: err => {
        this.loading = false;
        this.message = err?.error?.message ?? 'Asset report failed.';
      }
    });
  }

  exportCsv(): void {
    if (!this.rows.length || !this.columns.length) {
      this.message = 'Load a report before exporting.';
      return;
    }

    const lines = [
      this.columns.join(','),
      ...this.rows.map(row =>
        this.columns
          .map(column => `"${row[column] ?? ''}"`)
          .join(',')
      )
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.selectedReport}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  exportExcel(): void {
    if (!this.rows.length || !this.columns.length) {
      this.message = 'Load a report before exporting.';
      return;
    }

    const rows = this.rows
      .map(row =>
        `<tr>${this.columns
          .map(column => `<td>${this.htmlValue(row[column])}</td>`)
          .join('')}</tr>`
      )
      .join('');

    const html = `
      <html>
        <head><meta charset="utf-8"></head>
        <body>
          <h2>${this.htmlValue(this.reportName())}</h2>
          <table border="1">
            <thead>
              <tr>${this.columns.map(column => `<th>${this.htmlValue(column)}</th>`).join('')}</tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>`;

    this.downloadBlob(
      html,
      'application/vnd.ms-excel;charset=utf-8',
      `${this.selectedReport}.xls`
    );
  }

  exportPdf(): void {
    if (!this.rows.length || !this.columns.length) {
      this.message = 'Load a report before exporting.';
      return;
    }

    const rows = this.rows
      .map(row =>
        `<tr>${this.columns
          .map(column => `<td>${this.htmlValue(row[column])}</td>`)
          .join('')}</tr>`
      )
      .join('');

    const html = `
      <html>
        <head>
          <title>${this.htmlValue(this.reportName())}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
            h1 { margin: 0 0 4px; font-size: 22px; }
            p { margin: 0 0 16px; color: #4b5563; }
            table { border-collapse: collapse; width: 100%; font-size: 11px; }
            th, td { border: 1px solid #d0d7de; padding: 6px; text-align: left; }
            th { background: #eff6ff; color: #1e3a8a; }
            @media print { button { display: none; } body { padding: 0; } }
          </style>
        </head>
        <body>
          <button onclick="window.print()">Print / Save as PDF</button>
          <h1>${this.htmlValue(this.reportName())}</h1>
          <p>Generated: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>${this.columns.map(column => `<th>${this.htmlValue(column)}</th>`).join('')}</tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <script>setTimeout(function () { window.print(); }, 300);</script>
        </body>
      </html>`;

    const popup = window.open('', '_blank');

    if (!popup) {
      this.message = 'Popup blocked. Please allow popups for PDF print.';
      return;
    }

    popup.document.open();
    popup.document.write(html);
    popup.document.close();
  }

  private reportName(): string {
    return this.reports.find(report => report.key === this.selectedReport)?.name ?? this.selectedReport;
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

  private htmlValue(value: any): string {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
