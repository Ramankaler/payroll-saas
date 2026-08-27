import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountsService } from './accounts.service';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss'],
})
export class AccountsComponent implements OnInit {
  private readonly accountsService = inject(AccountsService);

  activeTab = 'chart';
  loading = false;
  saving = false;
  message = '';

  accounts: any[] = [];
  journals: any[] = [];
  reportRows: any[] = [];
  reportColumns: string[] = [];

  accountTypes = ['Asset', 'Liability', 'Equity', 'Income', 'Expense'];
  normalBalances = ['Debit', 'Credit'];
  reportTypes = [
    { key: 'trial-balance', name: 'Trial Balance' },
    { key: 'profit-loss', name: 'Profit & Loss' },
    { key: 'balance-sheet', name: 'Balance Sheet' },
    { key: 'vat-summary', name: 'VAT Summary' },
  ];

  accountEditId: number | null = null;
  payrollId: number | null = null;

  settings: any = {
    legalName: '',
    trn: '',
    vatRegistered: false,
    fiscalYearStartMonth: 1,
  };

  accountForm: any = this.emptyAccount();
  journalForm: any = this.emptyJournal();

  filters: any = {
    from: '',
    to: '',
    status: '',
    limit: 100,
  };

  reportFilter: any = {
    report: 'trial-balance',
    from: '',
    to: '',
  };

  ngOnInit(): void {
    this.setCurrentMonth();
    this.loadAll();
  }

  loadAll(): void {
    this.loadSettings();
    this.loadChart();
    this.loadJournals();
  }

  loadSettings(): void {
    this.accountsService.getSettings().subscribe({
      next: (settings) => this.settings = {
        legalName: settings?.legalName || '',
        trn: settings?.trn || '',
        vatRegistered: !!settings?.vatRegistered,
        fiscalYearStartMonth: settings?.fiscalYearStartMonth || 1,
      },
    });
  }

  saveSettings(): void {
    this.saving = true;
    this.message = '';

    this.accountsService.saveSettings(this.settings).subscribe({
      next: () => {
        this.saving = false;
        this.message = 'Account settings saved.';
      },
      error: (error) => {
        this.saving = false;
        this.message =
          error?.error?.message ??
          'Settings save failed.';
      },
    });
  }

  loadChart(): void {
    this.loading = true;

    this.accountsService.getChart().subscribe({
      next: (accounts) => {
        this.accounts = accounts || [];
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.message =
          error?.error?.message ??
          'Chart of accounts could not be loaded.';
      },
    });
  }

  seedChart(): void {
    this.accountsService.seedChart().subscribe({
      next: (result) => {
        this.message = result?.message ?? 'Default chart created.';
        this.loadChart();
      },
      error: (error) => {
        this.message =
          error?.error?.message ??
          'Default chart failed.';
      },
    });
  }

  saveAccount(): void {
    if (!this.accountForm.accountCode?.trim() ||
        !this.accountForm.accountName?.trim()) {
      this.message = 'Account code and name are required.';
      return;
    }

    this.saving = true;
    this.message = '';

    const request = this.accountEditId
      ? this.accountsService.updateAccount(this.accountEditId, this.accountForm)
      : this.accountsService.createAccount(this.accountForm);

    request.subscribe({
      next: () => {
        this.saving = false;
        this.message = this.accountEditId
          ? 'Account updated.'
          : 'Account created.';
        this.resetAccount();
        this.loadChart();
      },
      error: (error) => {
        this.saving = false;
        this.message =
          error?.error?.message ??
          'Account save failed.';
      },
    });
  }

  editAccount(account: any): void {
    this.accountEditId = account.accountID;
    this.accountForm = {
      accountCode: account.accountCode,
      accountName: account.accountName,
      accountType: account.accountType,
      normalBalance: account.normalBalance,
    };
  }

  toggleAccount(account: any): void {
    this.accountsService
      .updateAccountStatus(account.accountID, !account.isActive)
      .subscribe({
        next: () => this.loadChart(),
        error: (error) => {
          this.message =
            error?.error?.message ??
            'Account status failed.';
        },
      });
  }

  resetAccount(): void {
    this.accountEditId = null;
    this.accountForm = this.emptyAccount();
  }

  loadJournals(): void {
    this.accountsService.getJournals(this.filters).subscribe({
      next: (journals) => this.journals = journals || [],
      error: (error) => {
        this.message =
          error?.error?.message ??
          'Journals could not be loaded.';
      },
    });
  }

  addLine(): void {
    this.journalForm.lines.push({
      accountID: null,
      debit: 0,
      credit: 0,
      notes: '',
    });
  }

  removeLine(index: number): void {
    if (this.journalForm.lines.length <= 2) {
      return;
    }

    this.journalForm.lines.splice(index, 1);
  }

  get debitTotal(): number {
    return this.journalForm.lines
      .reduce((total: number, line: any) =>
        total + Number(line.debit || 0), 0);
  }

  get creditTotal(): number {
    return this.journalForm.lines
      .reduce((total: number, line: any) =>
        total + Number(line.credit || 0), 0);
  }

  saveJournal(): void {
    if (this.debitTotal !== this.creditTotal) {
      this.message = 'Debit and credit must be equal.';
      return;
    }

    this.saving = true;
    this.message = '';

    this.accountsService.createJournal(this.journalForm).subscribe({
      next: () => {
        this.saving = false;
        this.message = 'Draft journal saved.';
        this.journalForm = this.emptyJournal();
        this.loadJournals();
      },
      error: (error) => {
        this.saving = false;
        this.message =
          error?.error?.message ??
          'Journal save failed.';
      },
    });
  }

  postJournal(journal: any): void {
    this.accountsService.postJournal(journal.journalID).subscribe({
      next: () => {
        this.message = 'Journal posted.';
        this.loadJournals();
      },
      error: (error) => {
        this.message =
          error?.error?.message ??
          'Journal post failed.';
      },
    });
  }

  reverseJournal(journal: any): void {
    if (!confirm('Reverse this posted journal?')) {
      return;
    }

    this.accountsService.reverseJournal(journal.journalID).subscribe({
      next: () => {
        this.message = 'Reversal journal created.';
        this.loadJournals();
      },
      error: (error) => {
        this.message =
          error?.error?.message ??
          'Journal reversal failed.';
      },
    });
  }

  postPayroll(): void {
    if (!this.payrollId || this.payrollId <= 0) {
      this.message = 'Enter payroll ID.';
      return;
    }

    this.accountsService.postPayroll(this.payrollId).subscribe({
      next: () => {
        this.message = 'Payroll posted to accounts.';
        this.loadJournals();
      },
      error: (error) => {
        this.message =
          error?.error?.message ??
          'Payroll posting failed.';
      },
    });
  }

  loadReport(): void {
    this.loading = true;
    this.reportRows = [];
    this.reportColumns = [];

    this.accountsService
      .getReport(this.reportFilter.report, this.reportFilter)
      .subscribe({
        next: (rows) => {
          this.reportRows = rows || [];
          this.reportColumns = this.reportRows.length
            ? Object.keys(this.reportRows[0])
            : [];
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.message =
            error?.error?.message ??
            'Report failed.';
        },
      });
  }

  setTab(tab: string): void {
    this.activeTab = tab;
  }

  get selectedReportName(): string {
    const selected = this.reportTypes
      .find(report => report.key === this.reportFilter.report);

    return selected?.name ?? 'Report';
  }

  private emptyAccount(): any {
    return {
      accountCode: '',
      accountName: '',
      accountType: 'Asset',
      normalBalance: 'Debit',
    };
  }

  private emptyJournal(): any {
    return {
      journalDate: this.today(),
      module: 'Manual',
      referenceNo: '',
      narration: '',
      lines: [
        { accountID: null, debit: 0, credit: 0, notes: '' },
        { accountID: null, debit: 0, credit: 0, notes: '' },
      ],
    };
  }

  private setCurrentMonth(): void {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    this.filters.from = this.toDateInput(firstDay);
    this.filters.to = this.toDateInput(lastDay);
    this.reportFilter.from = this.filters.from;
    this.reportFilter.to = this.filters.to;
  }

  private today(): string {
    return this.toDateInput(new Date());
  }

  private toDateInput(value: Date): string {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
