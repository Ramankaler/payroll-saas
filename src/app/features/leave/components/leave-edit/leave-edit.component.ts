import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LeaveService, LeaveDto } from '../../services/leave.service';
import { EmployeeService } from '../../../employees/employee.service';
import { LeaveTypeService } from '../../services/leave-type.service';

@Component({
  selector: 'app-leave-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule],
  templateUrl: './leave-edit.component.html',
  styleUrls: ['./leave-edit.component.scss']
})
export class LeaveEditComponent implements OnInit {
  leave: any = {
    id: 0,
    empID: 0,
    leaveTypeID: 0,
    startDate: '',
    endDate: '',
    isHalfDay: false,
    halfDayType: 'First Half',
    reason: '',
    status: '',
    approvedBy: 0,
    CreatedAt: ''
  };

  employees: any[] = [];
  leaveTypes: any[] = [];
  compId = 1;
  halfDayTypes = ['First Half', 'Second Half'];
  isReadonly = false;

  constructor(
    private leaveService: LeaveService,
    private employeeService: EmployeeService,
    private leaveTypeService: LeaveTypeService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadLeave(id);
    }
    this.loadDropdowns();
  }

  loadLeave(id: number): void {
    this.leaveService.getById(id).subscribe({
      next: (leave) => {
        this.leave = leave;

        if(leave.status !== 'pending'){
          this.isReadonly=true;
        }
      }
    });
  }

  loadDropdowns(): void {
    this.employeeService.getAll(this.compId).subscribe(employees => {
      this.employees = employees;
    });

    this.leaveTypeService.getAll(this.compId).subscribe(leaveTypes => {
      this.leaveTypes = leaveTypes;
    });
  }

  save(): void {
    this.leaveService.update(this.leave.id, this.leave).subscribe({
      next: () => {
        this.snackBar.open('Leave updated', 'Close', { duration: 3000 });
        this.router.navigate(['/leave']);
      },
      error: () => this.snackBar.open('Update failed', 'Close')
    });
  }
}

