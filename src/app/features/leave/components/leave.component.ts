import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

interface LeaveRequest {
  id: string;
  employeeName: string;
  type: string;
  dates: string;
  days: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

@Component({
  selector: 'app-leave',
  standalone: true,
  imports: [CommonModule, MatTabsModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  templateUrl: './leave.component.html',
  styleUrls: ['./leave.component.scss'],
})
export class LeaveComponent {
  myLeaves: LeaveRequest[] = [
    { id: '1', employeeName: 'John Doe', type: 'Annual Leave', dates: 'May 25 - May 27', days: 3, reason: 'Personal vacation', status: 'Approved' },
    { id: '2', employeeName: 'Sarah Wilson', type: 'Sick Leave', dates: 'May 20', days: 1, reason: 'Flu recovery', status: 'Approved' },
  ];
  teamApprovals: LeaveRequest[] = [
    { id: '3', employeeName: 'Emma Davis', type: 'Casual Leave', dates: 'May 28', days: 1, reason: 'Personal matter', status: 'Pending' },
  ];

  approveLeave(id: string): void {
    const leave = [...this.myLeaves, ...this.teamApprovals].find(l => l.id === id);
    if (leave) leave.status = 'Approved';
  }

  rejectLeave(id: string): void {
    const leave = [...this.myLeaves, ...this.teamApprovals].find(l => l.id === id);
    if (leave) leave.status = 'Rejected';
  }
}
