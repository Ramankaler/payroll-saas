import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ReimbursementService } from '../../services/reimbursement.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthSessionService } from '../../../../core/services/auth-session.service';

@Component({
  selector: 'app-reimbursement-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatSnackBarModule],
  templateUrl: './reimbursement-list.component.html'
})
export class ReimbursementListComponent implements OnInit {
  private readonly authSession =  inject(AuthSessionService);
  reimbursements: any[] = [];
  searchTerm = '';
  status = 'All';
  page = 1;
  pageSize = 25;
  totalRecords = 0;
  loading = false;
  get compId(): number {
  return this.authSession.companyId;
}

  constructor(
    private reimbursementService: ReimbursementService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;

    this.reimbursementService
      .getPage(this.compId, this.page, this.pageSize, this.searchTerm, this.status)
      .subscribe({
        next: (result: any) => {
          this.reimbursements = result?.data || [];
          this.totalRecords = result?.totalRecords || 0;
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          const message =
            err?.error?.message || 'Failed to load reimbursements.';

          this.snackBar.open(message, 'Close', {
            duration: 4000
          });
        }
      });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalRecords / this.pageSize));
  }

  searchClaims(): void {
    this.page = 1;
    this.loadData();
  }

  changePageSize(): void {
    this.page = 1;
    this.loadData();
  }

  previousPage(): void {
    if (this.page <= 1) {
      return;
    }

    this.page--;
    this.loadData();
  }

  nextPage(): void {
    if (this.page >= this.totalPages) {
      return;
    }

    this.page++;
    this.loadData();
  }

  statusClass(status: string): string {
    return String(status || '').toLowerCase();
  }

  getEmployeeName(reim: any): string {
    const name = `${reim.firstName || ''} ${reim.lastName || ''}`.trim();
    const code = reim.empCode ? `${reim.empCode} - ` : '';

    return `${code}${name || 'Unknown'}`;
  }

  getExpenseType(reim: any): string {
    return reim.expenseType || reim.category || '-';
  }

  applyFilter(): void {
    this.searchClaims();
  }

cancelReimbursement(id: number): void {
  if (!confirm('Cancel this reimbursement claim?')) {
    return;
  }

  this.reimbursementService.cancel(id).subscribe({
    next: () => {
      this.loadData();

      this.snackBar.open('Reimbursement cancelled.', 'Close', {
        duration: 3000
      });
    },
    error: (err) => {
      const message =
        err?.error?.message || 'Failed to cancel reimbursement.';

      this.snackBar.open(message, 'Close', {
        duration: 4000
      });
    }
  });
}
}
