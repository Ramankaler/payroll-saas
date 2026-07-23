import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ReimbursementService } from '../../services/reimbursement.service';
import { EmployeeService } from '../../../employees/employee.service';
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
  filteredReimbursements: any[] = [];
  employees: any[] = [];
  searchTerm = '';
  get compId(): number {
  return this.authSession.companyId;
}

  constructor(
    private reimbursementService: ReimbursementService,
    private employeeService: EmployeeService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.reimbursementService.getAll(this.compId).subscribe((reims: any[]) => {
      this.reimbursements = reims;
      this.filteredReimbursements = [...reims];
    });

    this.employeeService.getAll(this.compId).subscribe((employees: any[]) => {
      this.employees = employees;
    });
  }

  getEmployeeName(empId: number): string {
    const emp = this.employees.find((e: any) => e.empID === empId);
    return emp ? emp.firstName + ' ' + emp.lastName : 'Unknown';
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredReimbursements = this.reimbursements.filter((reim: any) => {
      const empName = this.getEmployeeName(reim.empID).toLowerCase();
      return empName.includes(term) ||
             reim.description.toLowerCase().includes(term) ||
             reim.expenseType.toLowerCase().includes(term);
    });
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
