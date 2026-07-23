import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LeaveService, LeaveDto } from '../../services/leave.service';
import { EmployeeService } from '../../../employees/employee.service';
import { AuthSessionService } from '../../../../core/services/auth-session.service';

@Component({
  selector: 'app-leave-approve',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatSnackBarModule],
  templateUrl: './leave-approve.component.html',
  styleUrls: ['./leave-approve.component.scss']
})
export class LeaveApproveComponent implements OnInit {
private readonly authSession =  inject(AuthSessionService);
  leaves: LeaveDto[] = [];
  employees: any[] = [];
  get compId(): number {
  return this.authSession.companyId;
}
  status:any;
  processingId: number | null = null;

  constructor(
    private leaveService: LeaveService,
    private employeeService: EmployeeService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.leaveService.getAll(this.compId).subscribe(leaves => {
      this.leaves = leaves;
      // filter(l => l.status === 'pending');
    });

    this.employeeService.getAll(this.compId).subscribe(employees => {
      this.employees = employees;
    });
  }

  getEmployeeName(empId: number): string {
    const emp = this.employees.find(e => e.empID === empId);
    return emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown';
  }


  approveLeave(leave:any){
console.log('Approving leave:', leave);
if(leave==null){
  this.snackBar.open('Invalid leave ID', 'Close', { duration: 3000 });
  return;
}
if(leave.status !== 'pending'){
  this.snackBar.open('Only pending leaves can be approved', 'Close', { duration: 3000 });
  return;
}
else {
  this.leaveService.approve(leave.leaveID).subscribe({
    next: () => {
      this.snackBar.open('Leave approved', 'Close', { duration: 3000 });
      this.loadData();
    },
    error: () => {
      this.snackBar.open('Action failed', 'Close', { duration: 3000 });
    }
  });
}
}
rejectLeave(leave:any){

   this.leaveService
   .reject(leave.leaveID)
   .subscribe({

      next:()=>{

         this.snackBar.open(
            'Leave Rejected',
            'Close',
            { duration:3000 }
         );

         this.loadData();

      }

   });

}
}

// approveLeave(id: number): void {

//   this.processingId = id;

//   this.leaveService.approve(id, 'approved').subscribe({

//     next: () => {
//       this.processingId = null;
//       this.loadData();
//       this.snackBar.open('Leave approved', 'Close', { duration: 3000 });
//     },

//     error: () => {
//       this.processingId = null;
//       this.snackBar.open('Action failed', 'Close', { duration: 3000 });
//     }

//   });
// }

//   rejectLeave(id: number): void {

//   this.processingId = id;

//   this.leaveService.approve(id, 'rejected').subscribe({

//     next: () => {
//       this.processingId = null;
//       this.loadData();
//       this.snackBar.open('Leave rejected', 'Close', { duration: 3000 });
//     },

//     error: () => {
//       this.processingId = null;
//       this.snackBar.open('Action failed', 'Close', { duration: 3000 });
//     }

//   });
// }
