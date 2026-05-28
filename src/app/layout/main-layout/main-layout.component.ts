import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AiChatComponent } from '../../features/ai/components/ai-chat.component';

type NavItem = {
  label: string;
  route?: string;
  icon: string;
  children?: NavItem[];
};

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, RouterLink, RouterLinkActive, AiChatComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  isSidebarCollapsed = false;
  search = '';

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'grid' },
    {
      label: 'HR',
      icon: 'business',
      children: [
        { label: 'Employees', route: '/employees', icon: 'groups' },
        { label: 'Departments', route: '/departments', icon: 'apartment' },
        { label: 'Designations', route: '/designations', icon: 'badge' },
        { label: 'Leave Requests', route: '/leaves', icon: 'event_busy' },
        { label: 'Leave Types', route: '/leave-types', icon: 'list_alt' },
        { label: 'Leave Approve', route: '/leaves/approve', icon: 'check_circle' },
        { label: 'Attendance', route: '/attendance', icon: 'access_time' }
      ]
    },
    {
      label: 'Payroll',
      icon: 'account_balance_wallet',
      children: [
        { label: 'Payroll Runs', route: '/payroll', icon: 'payment' },
        { label: 'Reimbursements', route: '/reimbursement', icon: 'receipt' },
        { label: 'Reimbursement Approve', route: '/reimbursement/approve', icon: 'check_circle' },
        { label: 'Salary Structure', route: '/payroll/structure', icon: 'trending_up' }
      ]
    },
    {
      label: 'Reports',
      icon: 'assessment',
      children: [
        { label: 'Payroll Reports', route: '/reports/payroll', icon: 'bar_chart' },
        { label: 'Employee Reports', route: '/reports/employees', icon: 'people_alt' },
        { label: 'Attendance Reports', route: '/reports/attendance', icon: 'schedule' }
      ]
    },

    { label: 'Admin Settings', route: '/admin/settings', icon: 'settings' },

    {
  label: 'Organization',
  icon: 'corporate_fare',
  children: [
    { label: 'Companies', route: '/company', icon: 'domain' },
    { label: 'Branches', route: '/branch', icon: 'account_tree' }
  ]
},
  ];

  showAiChat = false;

  constructor(private readonly router: Router) {}

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleAiChat(): void {
    this.showAiChat = !this.showAiChat;
  }

  onProfileMenu(action: 'profile' | 'logout'): void {
    if (action === 'logout') {
      localStorage.removeItem('auth');
      this.router.navigate(['/login']);
    }
  }
}

