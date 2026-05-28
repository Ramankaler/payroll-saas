import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { API_ROUTES } from '../../../../core/config/api.config';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { logout } from '../../../auth/store/auth.actions';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    BaseChartDirective,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private readonly http = inject(HttpClient);
  readonly router = inject(Router);
  private readonly store = inject(Store);

  company: any | null = null;

  kpis = [
    { value: '247', label: 'Total Employees', trend: '+12%', type: 'up' },
    { value: '23', label: 'Active Leaves', trend: '+3%', type: 'up' },
    { value: '$47.2k', label: 'Monthly Payroll', trend: '-2%', type: 'down' },
    { value: '8', label: 'Pending Approvals', trend: '+5%', type: 'up' }
  ];

  chartLabels = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
  chartData: any = [{
    data: [35000, 42000, 38000, 45000, 52000, 47200],
    label: 'Payroll Cost',
    backgroundColor: 'rgba(79, 70, 229, 0.7)',
    borderColor: '#4f46e5',
    borderWidth: 2
  }];
  chartOptions: any = {
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: number) {
            return '$' + (value / 1000) + 'k';
          }
        }
      }
    }
  };

  recentActivities = [
    { id: 1, user: 'John Doe', message: 'Applied for annual leave', time: '2 min ago', icon: 'event' },
    { id: 2, user: 'Sarah Wilson', message: 'Payroll batch completed', time: '1 hr ago', icon: 'account_balance_wallet' },
    { id: 3, user: 'Mike Johnson', message: 'Attendance CSV imported', time: '3 hrs ago', icon: 'schedule' },
    { id: 4, user: 'Emma Davis', message: 'Leave request approved', time: '5 hrs ago', icon: 'check_circle' },
    { id: 5, user: 'System', message: 'Monthly reports generated', time: 'Yesterday', icon: 'analytics' }
  ];

  ngOnInit(): void {
    this.http.get(API_ROUTES.companiesMe).subscribe({
      next: (c) => this.company = c,
      error: () => this.company = null
    });
  }

  trackByFn(index: number, item: any): any {
    return item.id;
  }

  onQuickAction(type: 'employees' | 'payroll'): void {
    this.router.navigate([type === 'employees' ? '/employees' : '/payroll']);
  }

  onLogout(): void {
    this.store.dispatch(logout());
    this.router.navigate(['/login']);
  }
}

