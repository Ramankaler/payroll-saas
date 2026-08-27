import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LeaveService } from '../../services/leave.service';
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
searchTerm = '';
status = 'All';
page = 1;
pageSize = 25;
totalRecords = 0;
loading = false;
constructor(private leaveService:LeaveService, private snackBar: MatSnackBar,
  private router:Router) {

}
get companyId(): number {
  return this.authSession.companyId;
}

get totalPages(): number {
  return Math.max(1, Math.ceil(this.totalRecords / this.pageSize));
}

  ngOnInit(): void {
    // throw new Error('Method not implemented.');
this.loadData();
  }



  loadData(){
    this.loading = true;

    this.leaveService
      .getPage(this.companyId, this.page, this.pageSize, this.searchTerm, this.status)
      .subscribe({
      next:(res:any)=>{
        this.leaves=res?.data || [];
        this.totalRecords = res?.totalRecords || 0;
        this.loading = false;
      },
      error:()=>{
        this.loading = false;
        this.snackBar.open('Leaves could not be loaded.', 'Close', {
          duration: 4000
        });
      },
    })
  }

searchLeaves(): void {
  this.page = 1;
  this.loadData();
}

changePageSize(): void {
  this.page = 1;
  this.loadData();
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

statusClass(status: string): string {
  return String(status || '').toLowerCase();
}

getEmployeeName(leave:any):string{
  const name = `${leave.firstName || ''} ${leave.lastName || ''}`.trim();
  const code = leave.empCode ? `${leave.empCode} - ` : '';

  return `${code}${name || 'Unknown'}`;

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
