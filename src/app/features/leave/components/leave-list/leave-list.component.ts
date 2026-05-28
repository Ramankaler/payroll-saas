import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LeaveService, LeaveDto } from '../../services/leave.service';
import { EmployeeService } from '../../../employees/employee.service';
import { LeaveTypeService } from '../../services/leave-type.service';

@Component({
  selector: 'app-leave-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  templateUrl: './leave-list.component.html',
  styleUrls: ['./leave-list.component.scss']
})
export class LeaveListComponent implements OnInit {
  leaves: LeaveDto[] = [];
  filteredLeaves: LeaveDto[] = [];
  employees: any[] = [];
  leaveTypes: any[] = [];
  searchTerm = '';
  compId = 1;

  constructor(
    private leaveService: LeaveService,
    private employeeService: EmployeeService,
    private snackBar: MatSnackBar,
    private leaveTypeService: LeaveTypeService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

 loadData(): void {

  this.leaveService.getAll(this.compId).subscribe({
    next: (res) => {
      this.leaves = res;
      console.log("Leaves", this.leaves)
      this.filteredLeaves = [...res];
    }
  });

  this.employeeService.getAll(this.compId).subscribe(employees => {
    this.employees = employees;
  });

  this.leaveTypeService.getAll(this.compId).subscribe(types => {
    this.leaveTypes = types;
    console.log("leave types",this.leaveTypes)
  });
}


  getEmployeeName(empId: number): string {
    const emp = this.employees.find(e => e.empID === empId);
    return emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown';
  }

  getLeaveTypeName(id: number): string {
  const type = this.leaveTypes.find(t => t.leaveTypeID === id);
  return type ? type.leaveName : 'Unknown';
}

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredLeaves = this.leaves.filter(leave =>
      this.getEmployeeName(leave.empID).toLowerCase().includes(term) ||
      leave.reason?.toLowerCase().includes(term) || ''
    );
  }

  calculateDays(leave: LeaveDto): number {
    if (!leave.startDate || !leave.endDate) return 0;
    const from = new Date(leave.startDate);
    const to = new Date(leave.endDate);
    const diffTime = Math.abs(to.getTime() - from.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return leave.isHalfDay ? 0.5 : diffDays;
  }

  deleteLeave(id: number): void {
    if (confirm('Delete this leave request?')) {
      this.leaveService.delete(id).subscribe({
        next: () => {
          this.loadData();
          this.snackBar.open('Leave deleted', 'Close', { duration: 3000 });
        },
        error: () => this.snackBar.open('Delete failed', 'Close')
      });
    }
  }
}

