import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReimbursementService } from '../../services/reimbursement.service';
import { AuthSessionService } from '../../../../core/services/auth-session.service';

@Component({
  selector: 'app-reimbursement-approve',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatSnackBarModule],
  templateUrl: './reimbursement-approve.component.html',
  styleUrls: ['./reimbursement-approve.component.scss']
})
export class ReimbursementApproveComponent implements OnInit {
  private readonly authSession =  inject(AuthSessionService);
  reimbursements: any[] = [];
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
      .getPage(this.compId, this.page, this.pageSize, '', 'Pending')
      .subscribe({
        next: result => {
          this.reimbursements = result?.data || [];
          this.totalRecords = result?.totalRecords || 0;
          this.loading = false;
        },
        error: err => {
          this.loading = false;
          const message =
            err?.error?.message ?? 'Reimbursements could not be loaded.';
          this.snackBar.open(message, 'Close', { duration: 4000 });
        }
      });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalRecords / this.pageSize));
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

  changePageSize(): void {
    this.page = 1;
    this.loadData();
  }

  getEmployeeName(reim: any): string {
    const name = `${reim.firstName || ''} ${reim.lastName || ''}`.trim();
    const code = reim.empCode ? `${reim.empCode} - ` : '';

    return `${code}${name || 'Unknown'}`;
  }

  getExpenseType(reim: any): string {
    return reim.expenseType || reim.category || '-';
  }

  approve(id: number): void {
    this.reimbursementService.approve(id, 'approved').subscribe({
      next: () => {
        this.loadData();
        this.snackBar.open('Reimbursement approved', 'Close', { duration: 3000 });
      }
    });
  }

  reject(id: number): void {
    this.reimbursementService.approve(id, 'rejected').subscribe({
      next: () => {
        this.loadData();
        this.snackBar.open('Reimbursement rejected', 'Close', { duration: 3000 });
      }
    });
  }
}

