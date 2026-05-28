import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/components/login/login.component';
import { DashboardComponent } from './features/dashboard/components/dashboard/dashboard.component';
import { EmployeeListComponent } from './features/employees/components/employee-list/employee-list.component';
import { EmployeeCreateComponent } from './features/employees/components/employee-create/employee-create.component';
import { EmployeeEditComponent } from './features/employees/components/employee-edit/employee-edit.component';
import { AttendanceComponent } from './features/attendance/components/attendance.component';
import { LeaveComponent } from './features/leave/components/leave.component';
import { PayrollComponent } from './features/payroll/components/payroll.component';
import { ReportsComponent } from './features/reports/components/reports.component';
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
import { CompanyCreateComponent } from './features/companies/components/company-create/company-create.component';
import { CompanyEditComponent } from './features/companies/components/company-edit/company-edit.component';
import { CompanyListComponent } from './features/companies/components/company-list/company-list.component';
import { BranchCreateComponent } from './features/branches/components/branch-create/branch-create.component';
import { BranchListComponent } from './features/branches/components/branch-list/branch-list.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
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
      { path: 'leave', component: LeaveComponent },
      { path: 'leaves', component: LeaveListComponent },
      { path: 'leaves/create', component: LeaveCreateComponent },
      { path: 'leaves/edit/:id', component: LeaveEditComponent },
      { path: 'leaves/approve', component: LeaveApproveComponent },
      { path: 'leave-types', component: LeaveTypeListComponent },
      { path: 'reimbursement', component: ReimbursementListComponent },
      { path: 'reimbursement/create', component: ReimbursementCreateComponent },
      { path: 'reimbursement/edit/:id', component: ReimbursementEditComponent },
      { path: 'reimbursement/approve', component: ReimbursementApproveComponent },
      { path: 'payroll', component: PayrollComponent },
      { path: 'reports', component: ReportsComponent },
      { path: 'admin/settings', component: AdminSettingsComponent },
// company module routes
{ path: 'company', component: CompanyListComponent },
{ path: 'company/create', component: CompanyCreateComponent },
{ path: 'company/edit/:id', component: CompanyEditComponent },
//  branch module routes
{ path: 'branch', component: BranchListComponent },
{ path: 'branch/create', component: BranchCreateComponent },

      { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
    ]
  },
  { path: '**', redirectTo: 'dashboard' },
];

