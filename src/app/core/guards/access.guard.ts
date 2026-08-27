import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';

interface StoredAuthentication {
  roles?: string[];
  permissions?: string[];
}

export const accessGuard: CanActivateChildFn = (_route, state) => {
  const router = inject(Router);

  try {
    const authentication = JSON.parse(
      localStorage.getItem('auth') ?? '{}'
    ) as StoredAuthentication;

    const roles = authentication.roles ?? [];
    const permissions = authentication.permissions ?? [];
    const isAdmin = ['SuperAdmin', 'Admin', 'GM']
      .some((role) => roles.includes(role));

    if (isAdmin) return true;

    const employeeRoutes = [
      '/dashboard',
      '/my-attendance',
      '/my-leaves',
      '/my-reimbursements',
      '/my-payslips',
      '/my-gatepasses',
      '/my-advances',
      '/my-resignation',
    ];

    if (employeeRoutes.includes(state.url)) return true;

    if (
      state.url === '/team-approvals' &&
      roles.includes('Manager')
    ) {
      return true;
    }

    const neededPermission = getNeededPermission(state.url);

    if (
      neededPermission &&
      hasPermission(permissions, neededPermission)
    ) {
      return true;
    }

    return router.createUrlTree(['/dashboard']);
  } catch {
    return router.createUrlTree(['/login']);
  }
};

function getNeededPermission(url: string): string | null {
  const path = url.split('?')[0];

  if (path.startsWith('/employees/create')) return 'employee.create';
  if (path.startsWith('/employees/edit')) return 'employee.update';
  if (path.startsWith('/employees')) return 'employee.read';

  if (path.startsWith('/departments/create')) return 'department.create';
  if (path.startsWith('/departments/edit')) return 'department.update';
  if (path.startsWith('/departments')) return 'department.read';

  if (path.startsWith('/designations/create')) return 'designation.create';
  if (path.startsWith('/designations/edit')) return 'designation.update';
  if (path.startsWith('/designations')) return 'designation.read';

  if (path.startsWith('/attendance')) return 'attendance.view';
  if (path.startsWith('/gatepass')) return 'gatepass.view';
  if (path.startsWith('/shifts')) return 'shift.read';
  if (path.startsWith('/devices')) return 'attendance.view';
  if (path.startsWith('/team-approvals')) return 'team.view';

  if (path.startsWith('/leaves/approve')) return 'leave.approve';
  if (path.startsWith('/leaves/create')) return 'leave.create';
  if (path.startsWith('/leaves/edit')) return 'leave.update';
  if (path.startsWith('/leaves')) return 'leave.view';
  if (path.startsWith('/leave-types')) return 'leave.type.manage';

  if (path.startsWith('/reimbursement/approve')) return 'reimbursement.approve';
  if (path.startsWith('/reimbursement/create')) return 'reimbursement.create';
  if (path.startsWith('/reimbursement/edit')) return 'reimbursement.update';
  if (path.startsWith('/reimbursement')) return 'reimbursement.view';

  if (path.startsWith('/payroll')) return 'payroll.view';
  if (path.startsWith('/advances')) return 'advance.view';
  if (path.startsWith('/resignations')) return 'resignation.view';
  if (path.startsWith('/accounts')) return 'account.view';
  if (path.startsWith('/assets/allocations')) return 'asset.allocate';
  if (path.startsWith('/assets/reports')) return 'asset.report';
  if (path.startsWith('/assets')) return 'asset.read';
  if (path.startsWith('/reports')) return 'reports.view';
  if (path.startsWith('/users')) return 'role.manage';
  if (path.startsWith('/admin/settings')) return 'company.update';

  if (path.startsWith('/company/edit')) return 'company.update';
  if (path.startsWith('/company')) return 'company.read';
  if (path.startsWith('/branch/create')) return 'branch.create';
  if (path.startsWith('/branch')) return 'branch.read';

  return null;
}

function hasPermission(permissions: string[], permission: string): boolean {
  return getPermissionAliases(permission)
    .some((item) => permissions.includes(item));
}

function getPermissionAliases(permission: string): string[] {
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
