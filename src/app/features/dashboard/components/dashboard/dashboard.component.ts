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
import { SelfServiceApi } from '../../../self-service/self-service.api';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private readonly http = inject(HttpClient);
  readonly router = inject(Router);
  private readonly store = inject(Store);
  private readonly selfApi = inject(SelfServiceApi);

  company: any | null = null;
  selfDashboard: any | null = null;
  adminDashboard: any | null = null;
  isEmployee = false;
  dashboardMessage = '';
  showBirthdayWish = false;

  kpis: Array<{ value: string; label: string; trend: string; type: string }> = [];
  upcomingBirthdays: any[] = [];
  attentionItems: Array<{ label: string; value: number; icon: string }> = [];

  ngOnInit(): void {
    const authentication = JSON.parse(
      localStorage.getItem('auth') ?? '{}'
    ) as { employeeID?: number | null };

    this.isEmployee = typeof authentication.employeeID === 'number';

    if (this.isEmployee) {
      this.selfApi.dashboard().subscribe({
        next: (data) => {
          this.selfDashboard = data;
          this.showBirthdayWish = this.shouldShowBirthdayWish(data.employee?.dob);
          this.kpis = [
            { value: String(data.attendedDaysThisMonth), label: 'Days Present This Month', trend: '', type: 'up' },
            { value: String(data.pendingLeaves), label: 'Pending Leaves', trend: '', type: 'up' },
            { value: String(data.pendingReimbursements), label: 'Pending Reimbursements', trend: '', type: 'up' },
            { value: String(data.teamSize), label: 'Direct Reports', trend: '', type: 'up' },
          ];
        },
        error: () => this.selfDashboard = null,
      });
      return;
    }

    this.http.get(API_ROUTES.companiesMe).subscribe({
      next: (c) => this.company = c,
      error: () => this.company = null
    });

    this.http.get<any>(API_ROUTES.dashboard).subscribe({
      next: (data) => {
        this.adminDashboard = data;
        this.upcomingBirthdays = data.upcomingBirthdays ?? [];
        this.kpis = [
          { value: String(data.activeEmployees ?? 0), label: 'Active Employees', trend: '', type: 'up' },
          { value: String(data.onProbation ?? 0), label: 'On Probation', trend: '', type: 'up' },
          { value: String(data.pendingLeaves ?? 0), label: 'Pending Leaves', trend: '', type: 'up' },
          { value: String(data.pendingReimbursements ?? 0), label: 'Pending Reimbursements', trend: '', type: 'up' },
          { value: String(data.pendingAdvances ?? 0), label: 'Pending Advances', trend: '', type: 'up' },
          { value: String(data.currentMonthPayroll ?? 0), label: 'Current Month Payroll', trend: '', type: 'up' },
        ];
        this.attentionItems = [
          {
            label: 'Employees missing biometric ID',
            value: data.missingBioEmployees ?? 0,
            icon: 'fingerprint',
          },
          {
            label: 'Employees without manager',
            value: data.employeesWithoutManager ?? 0,
            icon: 'supervisor_account',
          },
          {
            label: 'Employees without shift',
            value: data.employeesWithoutShift ?? 0,
            icon: 'schedule',
          },
          {
            label: 'Documents expiring in 30 days',
            value: data.documentsExpiringSoon ?? 0,
            icon: 'assignment_late',
          },
          {
            label: 'Approved resignations in notice',
            value: data.activeResignations ?? 0,
            icon: 'person_remove',
          },
        ];
      },
      error: () => {
        this.dashboardMessage = 'Could not load dashboard.';
      },
    });
  }

  trackByFn(index: number, item: any): any {
    return item.id ?? item.empID ?? item.label ?? index;
  }

  onQuickAction(type: 'employees' | 'payroll'): void {
    this.router.navigate([type === 'employees' ? '/employees' : '/payroll']);
  }

  onLogout(): void {
    this.store.dispatch(logout());
    this.router.navigate(['/login']);
  }

  private shouldShowBirthdayWish(dob: string | null | undefined): boolean {
    if (!dob) {
      return false;
    }

    const birthDate = new Date(dob);
    const today = new Date();

    const isBirthday =
      birthDate.getMonth() === today.getMonth() &&
      birthDate.getDate() === today.getDate();

    if (!isBirthday) {
      return false;
    }

    const todayKey = today.toISOString().slice(0, 10);
    const storageKey = `birthday-wish-shown-${todayKey}`;

    if (localStorage.getItem(storageKey) === 'yes') {
      return false;
    }

    localStorage.setItem(storageKey, 'yes');
    return true;
  }
}

