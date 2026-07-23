import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReimbursementService } from '../../services/reimbursement.service';
import { EmployeeService } from '../../../employees/employee.service';
import { AuthSessionService } from '../../../../core/services/auth-session.service';

@Component({
  selector: 'app-reimbursement-create',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule],
  templateUrl: './reimbursement-create.component.html',
  styleUrls: ['./reimbursement-create.component.scss']
})
export class ReimbursementCreateComponent implements OnInit {
  private readonly authSession =   inject(AuthSessionService);
  reimbursement = {
    empID: 0,
    amount: 0,
    expenseType: 'Travel',
    description: '',
    billFile: null as File | null
  };

  employees: any[] = [];
 get compId(): number {
  return this.authSession.companyId;
}
  expenseTypes = ['Travel', 'Food', 'Medical', 'Office Expense', 'Other'];

  constructor(
    private reimbursementService: ReimbursementService,
    private employeeService: EmployeeService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.employeeService.getAll(this.compId).subscribe(employees => {
      this.employees = employees;
    });
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    this.reimbursement.billFile = file || null;
  }

  save(): void {
    if (!this.reimbursement.billFile) {
      this.snackBar.open('Please select bill file', 'Close');
      return;
    }

    const formData = new FormData();
    formData.append('compId', this.compId.toString());
    formData.append('empID', this.reimbursement.empID.toString());
    formData.append('amount', this.reimbursement.amount.toString());
    formData.append('expenseType', this.reimbursement.expenseType);
    formData.append('description', this.reimbursement.description);
    formData.append('billFile', this.reimbursement.billFile);

    this.reimbursementService.create(formData).subscribe({
      next: () => {
        this.snackBar.open('Reimbursement claim created', 'Close', { duration: 3000 });
        this.router.navigate(['/reimbursement']);
      },
      error: (err) => {
        const message =
          err?.error?.message ??
          err?.error?.error ??
          'Create failed';

        this.snackBar.open(message, 'Close', { duration: 5000 });
      }
    });
  }
}

