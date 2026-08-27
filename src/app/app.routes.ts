import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/components/login/login.component';
import { DashboardComponent } from './features/dashboard/components/dashboard/dashboard.component';
import { EmployeeListComponent } from './features/employees/components/employee-list/employee-list.component';
import { EmployeeCreateComponent } from './features/employees/components/employee-create/employee-create.component';
import { EmployeeEditComponent } from './features/employees/components/employee-edit/employee-edit.component';
import { AttendanceComponent } from './features/attendance/components/attendance.component';
import { LeaveComponent } from './features/leave/components/leave.component';
import { PayrollComponent } from './features/payroll/components/payroll.component';
// import { ReportsComponent } from './features/reports/components/reports.component';
import { AdminSettingsComponent } from './features/admin/components/admin-settings.component';
import { authGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { DepartmentListComponent } from './features/departments/components/department-list/department-list.component';
import { DesignationListComponent } from './features/designations/components/designation-list/designation-list.component';
import { LeaveListComponent } from './features/leave/components/leave-list/leave-list.component';
import { LeaveCreateComponent } from './features/leave/components/leave-create/leave-create.component';
import { LeaveEditComponent } from './features/leave/components/leave-edit/leave-edit.component';
import { LeaveApproveComponent } from './features/leave/components/leave-approve/leave-approve.component';
import { LeaveTypeListComponent } from './features/leave/components/leave-type-list/leave-type-list.component';
import { ReimbursementListComponent } from './features/reimbursement/components/reimbursement-list/reimbursement-list.component';
import { ReimbursementCreateComponent } from './features/reimbursement/components/reimbursement-create/reimbursement-create.component';
import { ReimbursementEditComponent } from './features/reimbursement/components/reimbursement-edit/reimbursement-edit.component';
import { ReimbursementApproveComponent } from './features/reimbursement/components/reimbursement-approve/reimbursement-approve.component';
import { CompanyEditComponent } from './features/companies/components/company-edit/company-edit.component';
import { CompanyListComponent } from './features/companies/components/company-list/company-list.component';
import { BranchCreateComponent } from './features/branches/components/branch-create/branch-create.component';
import { BranchListComponent } from './features/branches/components/branch-list/branch-list.component';
import { ShiftListComponent } from './features/shifts/components/shift-list/shift-list.component';
import { DeviceListComponent } from './features/devices/components/device-list/device-list.component';
import { GatePassComponent } from './features/gatepass/gatepass.component';
import { ChangePasswordComponent } from './features/auth/components/change-password/change-password.component';
import { accessGuard } from './core/guards/access.guard';
import { MyAttendanceComponent } from './features/self-service/my-attendance.component';
import { MyLeavesComponent } from './features/self-service/my-leaves.component';
import { MyReimbursementsComponent } from './features/self-service/my-reimbursements.component';
import { MyPayslipsComponent } from './features/self-service/my-payslips.component';
import { MyGatePassesComponent } from './features/self-service/my-gatepasses.component';
import { MyAdvancesComponent } from './features/self-service/my-advances.component';
import { MyResignationComponent } from './features/self-service/my-resignation.component';
import { TeamApprovalsComponent } from './features/self-service/team-approvals.component';
import { UserManagementComponent } from './features/admin/components/user-management/user-management.component';
import { AssetDetailsComponent } from './features/assets/components/asset-details/asset-details.component';
import { AssetAllocationComponent } from './features/assets/components/asset-allocation/asset-allocation.component';
import { AssetReportsComponent } from './features/assets/components/asset-reports/asset-reports.component';
import { ReportsComponent } from './features/reports/components/reports.component';
import { AccountsComponent } from './features/accounts/accounts.component';
import { AdvanceComponent } from './features/advances/advance.component';
import { ResignationComponent } from './features/resignations/resignation.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'change-password',
    component: ChangePasswordComponent,
    canActivate: [authGuard],
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    canActivateChild: [accessGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'my-attendance', component: MyAttendanceComponent },
      { path: 'my-leaves', component: MyLeavesComponent },
      { path: 'my-reimbursements', component: MyReimbursementsComponent },
      { path: 'my-payslips', component: MyPayslipsComponent },
      { path: 'my-gatepasses', component: MyGatePassesComponent },
      { path: 'my-advances', component: MyAdvancesComponent },
      { path: 'my-resignation', component: MyResignationComponent },
      { path: 'team-approvals', component: TeamApprovalsComponent },
      { path: 'users', component: UserManagementComponent },
      { path: 'employees', component: EmployeeListComponent },
      { path: 'employees/create', component: EmployeeCreateComponent },
      { path: 'employees/edit/:id', component: EmployeeEditComponent },
      { path: 'departments', component: DepartmentListComponent },
      { path: 'departments/create', component: DepartmentListComponent },
      { path: 'departments/edit/:id', component: DepartmentListComponent },
      { path: 'designations', component: DesignationListComponent },
      { path: 'designations/create', component: DesignationListComponent },
      { path: 'designations/edit/:id', component: DesignationListComponent },
      { path: 'attendance', component: AttendanceComponent },
      { path: 'shifts', component: ShiftListComponent },
      { path: 'devices', component: DeviceListComponent },
      { path: 'gatepass', component: GatePassComponent },
      { path: 'leave', component: LeaveComponent },
      { path: 'leaves', component: LeaveListComponent },
      { path: 'leaves/create', component: LeaveCreateComponent },
      { path: 'leaves/edit/:id', component: LeaveEditComponent },
      { path: 'leaves/approve', component: LeaveApproveComponent },
      { path: 'leave-types', component: LeaveTypeListComponent },
      { path: 'reimbursement', component: ReimbursementListComponent },
      { path: 'advances', component: AdvanceComponent },
      { path: 'resignations', component: ResignationComponent },
      { path: 'reimbursement/create', component: ReimbursementCreateComponent },
      { path: 'reimbursement/edit/:id', component: ReimbursementEditComponent },
      { path: 'reimbursement/approve', component: ReimbursementApproveComponent },
      { path: 'payroll', component: PayrollComponent },
      { path: 'assets', component: AssetDetailsComponent },
      { path: 'assets/allocations', component: AssetAllocationComponent },
      { path: 'assets/reports', component: AssetReportsComponent },
      { path: 'accounts', component: AccountsComponent },
      { path: 'reports', component: ReportsComponent },
      { path: 'admin/settings', component: AdminSettingsComponent },
// company module routes
{ path: 'company', component: CompanyListComponent },
{ path: 'company/edit/:id', component: CompanyEditComponent },
//  branch module routes
{ path: 'branch', component: BranchListComponent },
{ path: 'branch/create', component: BranchCreateComponent },

      { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
    ]
  },
  { path: '**', redirectTo: 'dashboard' },
];
