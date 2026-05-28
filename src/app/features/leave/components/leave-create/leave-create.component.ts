import { Component, importProvidersFrom, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgSelectOption } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LeaveService } from '../../services/leave.service';
import { EmployeeService } from '../../../employees/employee.service';
import { LeaveTypeService } from '../../services/leave-type.service';
import { HttpClient } from '@angular/common/http';
import { NgSelectComponent } from '@ng-select/ng-select';
import { map } from 'rxjs';

@Component({
  selector: 'app-leave-create',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule ],
  templateUrl: './leave-create.component.html',
  styleUrls: ['./leave-create.component.scss']
})
export class LeaveCreateComponent implements OnInit {
DEFAULT_COMP_ID = 1;
leave:any={
   startDate:'',
  endDate:'',
  leaveReason:'',
  leaveStatus:'',
  totalDays : '',
isHalfDay:'',
selectedHalf:''

};
leaves:any[]=[];
employees:any[]=[];
isHalfDay:boolean=false;
leaveTypes:any[]=[];
employeeCode:any;
fullName:any;
empDept:any;
selectedEmployeeID:any;
SelectedLeaveType:any;
selectedHalf:any;


constructor(private http:HttpClient,private router:Router,
   private employeeService:EmployeeService,
  private leaveTypeService : LeaveTypeService,
private leaveService:LeaveService){}
  ngOnInit(): void {
this.loadEmployees();
this.loadLeaveTypes();
  }

onCodeChange(value:any):void{
if (!value){

  this.clearAutoFields();
  return;
}

const foundEmp = this.employees.find((emp:any) =>
  emp.empCode?.trim().toLowerCase()=== value.trim().toLowerCase()
 );
 if(foundEmp){
  this.selectedEmployeeID = foundEmp.empID;
  console.log(this.selectedEmployeeID);
  this.fullName = `${foundEmp.firstName} ${foundEmp.lastName}`;
  // this.empDept = foundEmp.deptID? `Department ID: ${foundEmp.deptID}`
 }
 else{
   this.selectedEmployeeID = '';
  this.fullName = '';
  this.empDept = '';
 }
}

// Employee type service
loadEmployees(){
   this.employeeService.getAll(this.DEFAULT_COMP_ID).subscribe({
      next:(data)=>{
        this.employees = data;
        console.log("employee list :",this.employees)
//         .map((emp:any)=>({
// empID:emp.empID,
// fullName:`${emp.firstName} ${emp.lastName}`
//         }))
      }
    });

  this.leaveService.getAll(this.DEFAULT_COMP_ID).subscribe({
    next: (res) => {
      this.leaves = res;
      console.log("Leaves", this.leaves)
      // this.filteredLeaves = [...res];
    }
  });

  }
//

// Leave type service
loadLeaveTypes(){
  this.leaveTypeService.getAll(this.DEFAULT_COMP_ID).subscribe({
    next:(data)=>{
      this.leaveTypes=data;
      console.log('Leave types', this.leaveTypes);
    }
  })
}
//

// Leave Save service
saveLeave(){
  const payload = {
    empID : this.selectedEmployeeID,
    leaveTypeId: this.leave.leaveTypeID,
    startDate: this.leave.startDate,
    endDate: this.leave.endDate,
    reason: this.leave.leaveReason,
    totalDays : this.leave.totalDays,
    isHalfDay:this.leave.isHalfDay,
    halfDayType:this.leave.selectedHalf
  }

  this.leaveService.create(payload).subscribe({
    next:(res)=>{
      console.log("response",res);

    }
  })
}
//

  clearAutoFields(): void {
    this.selectedEmployeeID = null;
    this.fullName = '';
    this.empDept = '';
  }

  onleaveselection(event:any){
console.log(event.target.value);
  }
  onCheckChange(event:any){
console.log(event.target.value);

  }

  calculateDays(){

    if(this.leave.startDate && this.leave.endDate)
    {
      const from = new Date (this.leave.startDate)
      const to = new Date (this.leave.endDate)
      const timeDiff = to.getTime()-from.getTime();
const daysDiff = timeDiff/(1000*60*60*24)+1;
this.leave.totalDays = daysDiff;
    }

  }
}

