import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ReimbursementService } from '../../services/reimbursement.service';
import { EmployeeService } from '../../../employees/employee.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthSessionService } from '../../../../core/services/auth-session.service';

@Component({
  selector: 'app-reimbursement-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatSnackBarModule],
  templateUrl: './reimbursement-edit.component.html'
})
export class ReimbursementEditComponent implements OnInit {
  private readonly authSession =  inject(AuthSessionService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private reimbursementService = inject(ReimbursementService);
  private employeeService = inject(EmployeeService);

  reimbursementData: any = {
    reimbID: 0,
    empID: 0,
    amount: 0,
    expenseType: '',
    description: '',
    presentationCount: 1,
    selectedDate: new Date()
  };

  error = '';
  employees: any[] = [];
  employeeSearch = '';
  loadingEmployees = false;
  private employeeSearchTimer: any = null;
  expenseTypes = ['Travel', 'Food', 'Medical', 'Office Expense', 'Other'];
  selectedFile: File | null = null;

  ngOnInit(): void {
    this.loadReimbursement();
  }

  loadEmployees(): void {
    this.loadingEmployees = true;

    this.employeeService.lookup(this.employeeSearch, 20).subscribe({
      next: (res: any) => {
        this.employees = res || [];
        this.loadingEmployees = false;
        this.selectEmployee();
      },
      error: () => {
        this.employees = [];
        this.loadingEmployees = false;
      }
    });
  }

  employeeLabel(emp: any): string {
    const name = `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
    return `${emp.empCode} - ${name}`;
  }

  onEmployeeSearchChanged(): void {
    this.reimbursementData.empID = 0;

    if (this.employeeSearchTimer) {
      clearTimeout(this.employeeSearchTimer);
    }

    this.employeeSearchTimer = setTimeout(() => {
      this.loadEmployees();
    }, 300);
  }

  selectEmployee(): void {
    const value = this.employeeSearch.trim().toLowerCase();

    const selected = this.employees.find(emp =>
      this.employeeLabel(emp).toLowerCase() === value ||
      String(emp.empCode || '').toLowerCase() === value
    );

    this.reimbursementData.empID = selected
      ? selected.empID
      : this.reimbursementData.empID;
  }

  loadReimbursement(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id > 0) {
      this.reimbursementService.getById(id).subscribe({
        next: (data: any) => {
          this.reimbursementData = data;
          this.employeeService.getById(data.empID).subscribe({
            next: (employee: any) => {
              this.employees = [employee];
              this.employeeSearch = this.employeeLabel(employee);
            }
          });
        },
        error: (err: any) => {
          this.error = `Error loading: ${err.error?.message || 'Failed'}`;
          console.error('Error loading reimbursement:', err);
        }
      });
    }
  }

  onFileSelected(event: any): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] || null;
  }

  save(): void {
    this.error = '';
    this.selectEmployee();

    if (this.reimbursementData.amount <= 0 || !this.reimbursementData.empID || !this.reimbursementData.description) {
      this.error = 'Please fill all required fields';
      return;
    }

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (isNaN(id) || id <= 0) {
      this.error = 'Invalid reimbursement ID';
      return;
    }

    const payload: any = {
      ...this.reimbursementData,
      empID: Number(this.reimbursementData.empID),
      amount: Number(this.reimbursementData.amount),
      presentationCount: Number(this.reimbursementData.presentationCount),
      selectedDate: this.reimbursementData.selectedDate
    };

    this.reimbursementService.update(id, payload).subscribe({
      next: () => {
        this.snackBar.open('Reimbursement saved', 'Close', { duration: 2000 });
        this.router.navigate(['/reimbursement']);
      },
      error: (err: any) => {
        const errorMessage = err.error?.message || 'Save failed';
        this.error = `Error: ${errorMessage}`;
        console.error('Save error:', err);
        this.snackBar.open(errorMessage, 'Close', { duration: 2000 });
      }
    });
  }
}
