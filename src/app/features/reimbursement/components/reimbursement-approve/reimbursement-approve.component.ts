import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReimbursementService, ReimbursementDto } from '../../services/reimbursement.service';
import { EmployeeService } from '../../../employees/employee.service';

@Component({
  selector: 'app-reimbursement-approve',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatSnackBarModule],
  templateUrl: './reimbursement-approve.component.html',
  styleUrls: ['./reimbursement-approve.component.scss']
})
export class ReimbursementApproveComponent implements OnInit {
  reimbursements: ReimbursementDto[] = [];
  employees: any[] = [];
  compId = 1;

  constructor(
    private reimbursementService: ReimbursementService,
    private employeeService: EmployeeService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.reimbursementService.getAll(this.compId).subscribe(reims => {
      this.reimbursements = reims.filter(r => r.status === 'pending');
    });

    this.employeeService.getAll(this.compId).subscribe(employees => {
      this.employees = employees;
    });
  }

  getEmployeeName(empId: number): string {
    const emp = this.employees.find(e => e.empID === empId);
    return emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown';
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

