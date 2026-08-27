import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LeaveService, LeaveDto } from '../../services/leave.service';
import { EmployeeService } from '../../../employees/employee.service';
import { LeaveTypeService } from '../../services/leave-type.service';
import { AuthSessionService } from '../../../../core/services/auth-session.service';

@Component({
  selector: 'app-leave-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule],
  templateUrl: './leave-edit.component.html',
  styleUrls: ['./leave-edit.component.scss'],
})
export class LeaveEditComponent implements OnInit {
  private readonly authSession =   inject(AuthSessionService);
  leave: any = {};
  leaveTypes: any = {};
  employees: any[] = [];
  empID: any;
  EMPLOYEENAME: any;
  leaveID: any;
  startDate: any;
  endDate: any;
  createdAt:any;
get companyId(): number {
  return this.authSession.companyId;
}
  // createdAt: any = new Date().toISOString().split('T')[0];
  constructor(
    private route: ActivatedRoute,
    private leaveService: LeaveService,
    private employeeService: EmployeeService,
    private snackBar: MatSnackBar,
    private router: Router,
    private leaveTypeService: LeaveTypeService,
  ) {}

  ngOnInit() {
    this.loadLeaveTypes();
    this.leaveID = this.route.snapshot.paramMap.get('id');

    console.log('Leave ID from route:', this.leaveID);

    if (this.leaveID) {
      this.leaveID = parseInt(this.leaveID);

      this.loadEmployees();
    } else {
      this.snackBar.open('No Leave ID provided', 'Close', { duration: 3000 });

      this.router.navigate(['/leaves']);
    }
  }

  loadEmployees() {
    this.loadLeave(this.leaveID);
  }

  loadLeave(id: number) {
    this.leaveService.getById(id).subscribe({
      next: (res: any) => {
        this.leave.leaveID = res.leaveID;
        this.leave.leaveTypeID = res.leaveTypeID;
        this.leave.reason = res.reason || '';
        this.leave.startDate = res.startDate.split('T')[0];
        this.leave.endDate = res.endDate.split('T')[0];
        this.leave.createdAt = new Date(res.createdAt).toLocaleDateString('en-GB');

        this.employeeService.getById(res.empID).subscribe({
          next: (employee: any) => {
            this.leave.EMPLOYEENAME =
              `${employee.empCode} - ${employee.firstName} ${employee.lastName}`.trim();
          },
          error: () => {
            this.leave.EMPLOYEENAME = 'Unknown';
          }
        });
      },

      error: (err) => {
        console.error('Error fetching leave', err);

        this.snackBar.open('Error fetching leave details', 'Close', {
          duration: 3000,
        });
      },
    });
  }

  loadLeaveTypes() {
    this.leaveTypeService.getAll(this.companyId).subscribe({
      next: (res: any) => {
        this.leaveTypes = res;
        console.log('Leave Types', this.leaveTypes);
      },
    });
  }



updateLeave(){
this.leaveService.update(this.leaveID, {
  startDate:this.leave.startDate,
  endDate:this.leave.endDate,
  reason:this.leave.reason,
  leaveTypeID:this.leave.leaveTypeID,
}).subscribe({
  next: (res: any) => {
    this.snackBar.open('Leave updated successfully', 'Close', { duration: 3000 });
    this.router.navigate(['/leaves']);
  },
  error: (err) => {
    console.error('Error updating leave', err);
    this.snackBar.open('Error updating leave', 'Close', { duration: 3000 });
  }
});
}



}





