import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LeaveService, LeaveDto } from '../../services/leave.service';
import { EmployeeService } from '../../../employees/employee.service';
import { LeaveTypeService } from '../../services/leave-type.service';
import { Router } from '@angular/router';
import { AuthSessionService } from '../../../../core/services/auth-session.service';

@Component({
  selector: 'app-leave-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  templateUrl: './leave-list.component.html',
  styleUrls: ['./leave-list.component.scss']
})
export class LeaveListComponent implements OnInit {
 private readonly authSession =  inject(AuthSessionService);
leaves:any[]=[];
employees:any[]=[];
constructor(private leaveService:LeaveService, private snackBar: MatSnackBar,
  private employeeService: EmployeeService, private router:Router) {

}
get companyId(): number {
  return this.authSession.companyId;
}

  ngOnInit(): void {
    // throw new Error('Method not implemented.');
this.loadData();
  }



  loadData(){
    this.leaveService.getAll(this.companyId).subscribe({
      next:(res:any)=>{
        this.leaves=res;
        console.log("Leaves",this.leaves);
      }
    })

    this.employeeService.getAll(this.companyId).subscribe({
      next:(res:any)=>{
        this.employees=res;
        console.log("Employees",res);
      }
    })
  }
getEmployeeName(empId:number):string{
  const emp=this.employees.find(emp=>emp.empID===empId);
  return emp?emp.firstName+" "+emp.lastName:"Unknown";

}
editLeave(id:any){
  if(!id){
    this.snackBar.open("No Match Found","Close",{duration:3000});
    return;
  }
  this.router.navigate(['/leaves/edit/', id]);
}


addLeave(){
  this.router.navigate(['/leaves/create']);
}


cancelLeave(id: number): void {
  if (!confirm('Cancel this leave request?')) {
    return;
  }

  this.leaveService.cancel(id).subscribe({
    next: () => {
      this.snackBar.open('Leave request cancelled.', 'Close', {
        duration: 3000
      });

      this.loadData();
    },
    error: (err) => {
      const message =
        err?.error?.message || 'Failed to cancel leave request.';

      this.snackBar.open(message, 'Close', {
        duration: 4000
      });
    }
  });
}
}
