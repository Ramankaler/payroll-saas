import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LeaveService } from '../../services/leave.service';
import { AuthSessionService } from '../../../../core/services/auth-session.service';

@Component({
  selector: 'app-leave-approve',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatSnackBarModule],
  templateUrl: './leave-approve.component.html',
  styleUrls: ['./leave-approve.component.scss']
})
export class LeaveApproveComponent implements OnInit {
private readonly authSession =  inject(AuthSessionService);
  leaves: any[] = [];
  page = 1;
  pageSize = 25;
  totalRecords = 0;
  loading = false;
  get compId(): number {
  return this.authSession.companyId;
}
  status:any;
  processingId: number | null = null;

  constructor(
    private leaveService: LeaveService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;

    this.leaveService
      .getPage(this.compId, this.page, this.pageSize, '', 'Pending')
      .subscribe({
        next: result => {
          this.leaves = result?.data || [];
          this.totalRecords = result?.totalRecords || 0;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.snackBar.open('Leaves could not be loaded.', 'Close', {
            duration: 4000
          });
        }
      });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalRecords / this.pageSize));
  }

  previousPage(): void {
    if (this.page <= 1) {
      return;
    }

    this.page--;
    this.loadData();
  }

  nextPage(): void {
    if (this.page >= this.totalPages) {
      return;
    }

    this.page++;
    this.loadData();
  }

  changePageSize(): void {
    this.page = 1;
    this.loadData();
  }

  getEmployeeName(leave: any): string {
    const name = `${leave.firstName || ''} ${leave.lastName || ''}`.trim();
    const code = leave.empCode ? `${leave.empCode} - ` : '';

    return `${code}${name || 'Unknown'}`;
  }


  approveLeave(leave:any){
console.log('Approving leave:', leave);
if(leave==null){
  this.snackBar.open('Invalid leave ID', 'Close', { duration: 3000 });
  return;
}
if(String(leave.status || '').toLowerCase() !== 'pending'){
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
