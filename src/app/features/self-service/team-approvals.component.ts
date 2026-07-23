import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelfServiceApi } from './self-service.api';

@Component({
  selector: 'app-team-approvals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1>{{ finalApprover ? 'Final Approvals' : 'Team Approvals' }}</h1>
    <p *ngIf="error" style="color:#b00020">{{ error }}</p>
    <h2>Leave requests</h2>
    <table style="width:100%;border-collapse:collapse">
      <thead><tr><th>Employee</th><th>Leave</th><th>Dates</th><th>Status</th><th>Comments</th><th>Decision</th></tr></thead>
      <tbody><tr *ngFor="let item of leaves">
        <td>{{ item.empCode }} - {{ item.firstName }} {{ item.lastName }}</td><td>{{ item.leaveName }}</td>
        <td>{{ item.startDate | date:'mediumDate' }} - {{ item.endDate | date:'mediumDate' }}</td><td>{{ item.status }}</td>
        <td><input [(ngModel)]="item.comments" maxlength="500"></td>
        <td><button (click)="reviewLeave(item, 'approve')">Approve</button> <button (click)="reviewLeave(item, 'reject')">Reject</button></td>
      </tr></tbody>
    </table>
    <h2 style="margin-top:28px">Reimbursements</h2>
    <table style="width:100%;border-collapse:collapse">
      <thead><tr><th>Employee</th><th>Category</th><th>Amount</th><th>Status</th><th>Comments</th><th>Decision</th></tr></thead>
      <tbody><tr *ngFor="let item of reimbursements">
        <td>{{ item.empCode }} - {{ item.firstName }} {{ item.lastName }}</td><td>{{ item.category }}</td><td>{{ item.amount }}</td><td>{{ item.status }}</td>
        <td><input [(ngModel)]="item.comments" maxlength="500"></td>
        <td><button (click)="reviewReimbursement(item, 'approve')">Approve</button> <button (click)="reviewReimbursement(item, 'reject')">Reject</button></td>
      </tr></tbody>
    </table>
  `,
})
export class TeamApprovalsComponent implements OnInit {
  leaves: any[] = [];
  reimbursements: any[] = [];
  finalApprover = false;
  error = '';
  constructor(private readonly api: SelfServiceApi) {}
  ngOnInit(): void { this.load(); }
  load(): void {
    this.api.approvals().subscribe({
      next: (data) => {
        this.leaves = data.leaves;
        this.reimbursements = data.reimbursements;
        this.finalApprover = data.finalApprover;
      },
      error: (error) => this.error = error?.error?.message ?? 'Approvals could not be loaded.',
    });
  }
  reviewLeave(item: any, action: 'approve' | 'reject'): void {
    this.api.reviewLeave(item.leaveID, action, item.comments ?? '').subscribe({ next: () => this.load(), error: (error) => this.error = error?.error?.message ?? 'Decision failed.' });
  }
  reviewReimbursement(item: any, action: 'approve' | 'reject'): void {
    this.api.reviewReimbursement(item.reimbID, action, item.comments ?? '').subscribe({ next: () => this.load(), error: (error) => this.error = error?.error?.message ?? 'Decision failed.' });
  }
}
