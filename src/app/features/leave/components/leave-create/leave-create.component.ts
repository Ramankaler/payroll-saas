import { Component, importProvidersFrom, inject, OnInit } from '@angular/core';
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
import { AuthSessionService } from '../../../../core/services/auth-session.service';

@Component({
  selector: 'app-leave-create',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule ],
  templateUrl: './leave-create.component.html',
  styleUrls: ['./leave-create.component.scss']
})
export class LeaveCreateComponent implements OnInit {
private readonly authSession =   inject(AuthSessionService);
leave:any={
   startDate:'',
  endDate:'',
  leaveReason:'',
  leaveStatus:'',
  totalDays : '',
isHalfDay:false,
selectedHalf:''

};
get companyId(): number {
  return this.authSession.companyId;
}
leaves:any[]=[];
employees:any[]=[];
employeeSearch = '';
loadingEmployees = false;
private employeeSearchTimer: any = null;
isHalfDay:boolean=false;
leaveTypes:any[]=[];
employeeCode:any;
fullName:any;
empDept:any;
selectedEmployeeID:any;
SelectedLeaveType:any;
selectedHalf:any;
annualBalance:any;
balanceMessage = '';
saveMessage = '';


constructor(private http:HttpClient,private router:Router,
   private employeeService:EmployeeService,
  private leaveTypeService : LeaveTypeService,
private leaveService:LeaveService){}
  ngOnInit(): void {
this.loadEmployees();
this.loadLeaveTypes();
  }

onCodeChange(value:any):void{
this.employeeSearch = value;

if (this.employeeSearchTimer) {
  clearTimeout(this.employeeSearchTimer);
}

this.employeeSearchTimer = setTimeout(() => {
  this.loadEmployees();
}, 300);

if (!value){

  this.clearAutoFields();
  return;
}

this.selectEmployeeFromText(value);
}

selectEmployeeFromText(value:any):void{
const foundEmp = this.employees.find((emp:any) =>
  emp.empCode?.trim().toLowerCase()=== value.trim().toLowerCase() ||
  this.employeeLabel(emp).toLowerCase() === value.trim().toLowerCase()
 );
 if(foundEmp){
  this.selectedEmployeeID = foundEmp.empID;
  this.fullName = `${foundEmp.firstName} ${foundEmp.lastName}`;
  this.loadAnnualBalance();
  // this.empDept = foundEmp.deptID? `Department ID: ${foundEmp.deptID}`
 }
 else{
   this.selectedEmployeeID = '';
  this.fullName = '';
  this.empDept = '';
 }
}

employeeLabel(emp:any): string {
  const name = `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
  return `${emp.empCode} - ${name}`;
}

// Employee type service
loadEmployees(){
   this.loadingEmployees = true;

   this.employeeService.lookup(this.employeeSearch, 20).subscribe({
      next:(data)=>{
        this.employees = data;
        this.loadingEmployees = false;
        if (this.employeeSearch) {
          this.selectEmployeeFromText(this.employeeSearch);
        }
//         .map((emp:any)=>({
// empID:emp.empID,
// fullName:`${emp.firstName} ${emp.lastName}`
//         }))
      },
      error:()=>{
        this.employees = [];
        this.loadingEmployees = false;
      },
    });
  }
//

// Leave type service
loadLeaveTypes(){
  this.leaveTypeService.getAll(this.companyId).subscribe({
    next:(data)=>{
      this.leaveTypes=data;
      console.log('Leave types', this.leaveTypes);
    }
  })
}
//

// Leave Save service
saveLeave(){
  this.saveMessage = '';

  if (!this.selectedEmployeeID) {
    this.saveMessage = 'Please select a valid employee code.';
    return;
  }

  if (!this.leave.leaveTypeID) {
    this.saveMessage = 'Please select leave type.';
    return;
  }

  const payload = {
    empID : this.selectedEmployeeID,
    leaveTypeID: Number(this.leave.leaveTypeID),
    startDate: this.leave.startDate,
    endDate: this.leave.endDate,
    reason: this.leave.leaveReason,
    totalDays : Number(this.leave.totalDays || 0),
    isHalfDay:this.leave.isHalfDay,
    halfDayType:this.leave.selectedHalf
  }

  this.leaveService.create(payload).subscribe({
    next:(res)=>{
      console.log("response",res);
      this.saveMessage = 'Leave request saved.';

    },
    error:(err)=>{
      this.saveMessage =
        err?.error?.message ?? err?.error ?? 'Leave request failed.';
    }
  })
}
//

  clearAutoFields(): void {
    this.selectedEmployeeID = null;
    this.fullName = '';
    this.empDept = '';
    this.annualBalance = null;
    this.balanceMessage = '';
  }

  onleaveselection(event:any){
console.log(event.target.value);
this.loadAnnualBalance();
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
this.loadAnnualBalance();
    }

  }

  loadAnnualBalance(): void {
    this.balanceMessage = '';

    if (!this.selectedEmployeeID) {
      return;
    }

    const leaveType = this.leaveTypes.find((item:any) =>
      Number(item.leaveTypeID) === Number(this.leave.leaveTypeID)
    );

    const leaveName = leaveType?.leaveName?.toLowerCase() ?? '';

    if (
      !leaveName.includes('annual') &&
      !leaveName.includes('vacation')
    ) {
      this.annualBalance = null;
      return;
    }

    this.leaveService.getAnnualBalance(this.selectedEmployeeID).subscribe({
      next:(res)=>{
        this.annualBalance = res;
        this.balanceMessage =
          `Available annual leave: ${res.availableDays} days`;
      },
      error:()=>{
        this.balanceMessage = 'Could not load annual leave balance.';
      }
    });
  }
}

