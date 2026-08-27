import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Location } from '@angular/common';
import {
  animate,
  style,
  transition,
  trigger,
} from '@angular/animations';

type NavItem = {
  label: string;
  route?: string;
  icon: string;
  permission?: string;
  children?: NavItem[];
};

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
  animations: [
    trigger('routeFade', [
      transition('* <=> *', [
        style({
          opacity: 0,
          transform: 'translateY(10px)',
        }),
        animate(
          '180ms ease-out',
          style({
            opacity: 1,
            transform: 'translateY(0)',
          })
        ),
      ]),
    ]),
  ],
})
export class MainLayoutComponent {
  isSidebarCollapsed = false;
  search = '';
isMobileSidebarOpen = false;


  expandedMenu: string = '';

toggleMenu(menu: string) {

  if (this.expandedMenu === menu) {
    this.expandedMenu = '';
  }
  else {
    this.expandedMenu = menu;
  }

}

  private readonly authentication = this.readAuthentication();
  readonly username = this.authentication.username ?? 'User';
  readonly roleName = this.authentication.roles?.[0] ?? 'Employee';
  readonly avatar = this.username.slice(0, 2).toUpperCase();
  readonly permissions = this.authentication.permissions ?? [];
  readonly isAdmin = ['SuperAdmin', 'Admin', 'GM']
    .some((role) => this.authentication.roles?.includes(role));
  readonly isManager = this.authentication.roles?.includes('Manager') === true;

  readonly navItems: NavItem[] = this.buildNavigation();

  showAiChat = false;

  constructor(
    private readonly router: Router,
    private readonly location: Location
  ) {}

  private readAuthentication(): {
    username?: string;
    roles?: string[];
    permissions?: string[];
  } {
    try {
      return JSON.parse(localStorage.getItem('auth') ?? '{}');
    } catch {
      return {};
    }
  }

  private employeeNavigation(): NavItem[] {
    const items: NavItem[] = [
      { label: 'Dashboard', route: '/dashboard', icon: 'grid_view' },
      { label: 'My Attendance', route: '/my-attendance', icon: 'schedule' },
      { label: 'My Leaves', route: '/my-leaves', icon: 'event' },
      { label: 'My Reimbursements', route: '/my-reimbursements', icon: 'receipt' },
      { label: 'My Salary Slips', route: '/my-payslips', icon: 'payments' },
      { label: 'My Gate Passes', route: '/my-gatepasses', icon: 'meeting_room' },
      { label: 'My Advances', route: '/my-advances', icon: 'savings' },
      { label: 'My Resignation', route: '/my-resignation', icon: 'logout' },
    ];

    if (this.isManager) {
      items.push({
        label: 'Team Approvals',
        route: '/team-approvals',
        icon: 'approval',
      });
    }

    return items;
  }

  private buildNavigation(): NavItem[] {
    if (this.isAdmin) {
      return this.adminNavigation();
    }

    const adminItems = this.adminNavigation()
      .filter((item) => item.route !== '/dashboard')
      .map((item) => this.filterNavItem(item))
      .filter((item): item is NavItem => item !== null);

    return [
      ...this.employeeNavigation(),
      ...adminItems
    ];
  }

  private filterNavItem(item: NavItem): NavItem | null {
    if (item.children) {
      const children = item.children
        .map((child) => this.filterNavItem(child))
        .filter((child): child is NavItem => child !== null);

      if (children.length === 0) {
        return null;
      }

      return {
        ...item,
        children
      };
    }

    if (!item.permission) {
      return item;
    }

    return this.hasPermission(item.permission)
      ? item
      : null;
  }

  private hasPermission(permission: string): boolean {
    return this.getPermissionAliases(permission)
      .some((item) => this.permissions.includes(item));
  }

  private getPermissionAliases(permission: string): string[] {
    const aliases: Record<string, string[]> = {
      'company.update': ['company.manage'],
      'company.approve': ['company.manage'],
      'branch.create': ['branch.manage'],
      'branch.update': ['branch.manage'],
      'branch.status': ['branch.manage'],
      'branch.approve': ['branch.manage'],
      'department.create': ['department.manage'],
      'department.update': ['department.manage'],
      'designation.create': ['designation.manage'],
      'designation.update': ['designation.manage'],
      'attendance.create': ['attendance.manage'],
      'attendance.update': ['attendance.manage'],
      'attendance.approve': ['attendance.manage'],
      'shift.create': ['shift.manage'],
      'shift.update': ['shift.manage'],
      'shift.status': ['shift.manage'],
      'leave.create': ['leave.manage'],
      'leave.update': ['leave.manage'],
      'leave.cancel': ['leave.manage'],
      'leave.type.manage': ['leave.manage'],
      'reimbursement.create': ['reimbursement.manage'],
      'reimbursement.update': ['reimbursement.manage'],
      'reimbursement.cancel': ['reimbursement.manage'],
    };

    return [
      permission,
      ...(aliases[permission] ?? [])
    ];
  }

  private adminNavigation(): NavItem[] {
    return [
      { label: 'Dashboard', route: '/dashboard', icon: 'grid' },
      {
        label: 'HR',
        icon: 'business',
        children: [
          { label: 'Employees', route: '/employees', icon: 'groups', permission: 'employee.read' },
          { label: 'Departments', route: '/departments', icon: 'apartment', permission: 'department.read' },
          { label: 'Designations', route: '/designations', icon: 'badge', permission: 'designation.read' },
          { label: 'Leave Requests', route: '/leaves', icon: 'event_busy', permission: 'leave.view' },
          { label: 'Leave Types', route: '/leave-types', icon: 'list_alt', permission: 'leave.type.manage' },
          { label: 'Resignations', route: '/resignations', icon: 'person_remove', permission: 'resignation.view' },
          { label: 'Final Approvals', route: '/team-approvals', icon: 'check_circle', permission: 'team.view' },
          { label: 'Shifts', route: '/shifts', icon: 'schedule', permission: 'shift.read' },
          { label: 'Devices', route: '/devices', icon: 'devices', permission: 'attendance.view' },
          { label: 'Attendance', route: '/attendance', icon: 'access_time', permission: 'attendance.view' },
          { label: 'Gate Pass', route: '/gatepass', icon: 'meeting_room', permission: 'gatepass.view' },
        ],
      },
      {
        label: 'Payroll',
        icon: 'account_balance_wallet',
        children: [
          { label: 'Payroll Runs', route: '/payroll', icon: 'payment', permission: 'payroll.view' },
          { label: 'Salary Advances', route: '/advances', icon: 'savings', permission: 'advance.view' },
          { label: 'Reimbursements', route: '/reimbursement', icon: 'receipt', permission: 'reimbursement.view' },
        ],
      },
      {
        label: 'Assets',
        icon: 'inventory_2',
        children: [
          { label: 'Asset Details', route: '/assets', icon: 'category', permission: 'asset.read' },
          { label: 'Asset Allocation', route: '/assets/allocations', icon: 'assignment_ind', permission: 'asset.allocate' },
          { label: 'Asset Reports', route: '/assets/reports', icon: 'summarize', permission: 'asset.report' },
        ],
      },
      { label: 'Accounts', route: '/accounts', icon: 'account_balance', permission: 'account.view' },
      { label: 'Reports', route: '/reports', icon: 'assessment', permission: 'reports.view' },
      { label: 'Users & Permissions', route: '/users', icon: 'manage_accounts', permission: 'role.manage' },
      { label: 'Admin Settings', route: '/admin/settings', icon: 'settings', permission: 'company.update' },
      {
        label: 'Organization',
        icon: 'corporate_fare',
        children: [
          { label: 'Companies', route: '/company', icon: 'domain', permission: 'company.read' },
          { label: 'Branches', route: '/branch', icon: 'account_tree', permission: 'branch.read' },
        ],
      },
    ];
  }

 toggleSidebar(): void {

  if (window.innerWidth <= 768) {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }
  else {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

}

  toggleAiChat(): void {
    this.showAiChat = !this.showAiChat;
  }

  get showBackButton(): boolean {
    const currentUrl = this.router.url.split('?')[0];

    return currentUrl !== '/' &&
      currentUrl !== '/dashboard' &&
      currentUrl !== '/login' &&
      currentUrl !== '/change-password';
  }

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
      return;
    }

    this.router.navigate(['/dashboard']);
  }

  prepareRoute(outlet: RouterOutlet | null): string {
    if (!outlet) {
      return this.router.url;
    }

    try {
      if (!outlet.isActivated) {
        return this.router.url;
      }

      return outlet.activatedRouteData?.['animation'] ??
        outlet.activatedRoute.snapshot.routeConfig?.path ??
        this.router.url;
    } catch {
      return this.router.url;
    }
  }

  onProfileMenu(action: 'profile' | 'logout'): void {
    if (action === 'logout') {
      localStorage.removeItem('auth');
      this.router.navigate(['/login']);
    }
  }
  closeMobileSidebar(): void {
      if (window.innerWidth <= 768) {
    this.isMobileSidebarOpen = false;
  }
  }
}

