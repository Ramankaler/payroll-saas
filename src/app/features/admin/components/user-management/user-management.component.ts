import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../../../core/config/api.config';
import { AuthSessionService } from '../../../../core/services/auth-session.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="users-page">
      <div class="page-header">
        <div>
          <div class="page-kicker">Admin</div>
          <h1>Users & Permissions</h1>
          <p>Create users, give roles, and choose exact module permissions.</p>
        </div>
        <button class="primary-btn" type="button" (click)="load()" title="Refresh Users">
          <span class="material-icons">refresh</span>
          Refresh
        </button>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <span>Total Users</span>
          <strong>{{ users.length }}</strong>
        </div>
        <div class="stat-card">
          <span>Active</span>
          <strong>{{ activeCount }}</strong>
        </div>
        <div class="stat-card">
          <span>Password Change Pending</span>
          <strong>{{ pendingPasswordCount }}</strong>
        </div>
      </div>

      <div class="panel">
        <div class="panel-title">
          <div>
            <h2>Create Admin / GM</h2>
            <span>Employee login accounts are created from Employee Master. Create only Admin or GM users here.</span>
          </div>
        </div>

        <form #form="ngForm" (ngSubmit)="create(form)" class="create-form">
          <label>
            Username
            <input name="username" [(ngModel)]="model.username" required maxlength="100" autocomplete="off">
          </label>

          <label>
            Email
            <input type="email" name="email" [(ngModel)]="model.email" required email maxlength="254" autocomplete="off">
          </label>

          <label>
            Role
            <select name="roleName" [(ngModel)]="model.roleName" required>
              <option>Admin</option>
              <option>GM</option>
            </select>
          </label>

          <button class="primary-btn" type="submit" [disabled]="form.invalid || saving">
            <span class="material-icons">person_add</span>
            {{ saving ? 'Creating...' : 'Create User' }}
          </button>
        </form>
      </div>

      <div class="two-panels">
        <div class="panel">
          <div class="panel-title">
            <div>
              <h2>Role Permissions</h2>
              <span>Select a role, tick modules, then save.</span>
            </div>
          </div>

          <label>
            Role
            <select name="selectedRoleID" [(ngModel)]="selectedRoleID" (ngModelChange)="loadRolePermissions()">
              <option [ngValue]="0">Select role</option>
              <option *ngFor="let role of roles" [ngValue]="role.roleID">
                {{ role.roleName }}
              </option>
            </select>
          </label>

          <div class="quick-actions">
            <button type="button" (click)="selectAllPermissions()" [disabled]="selectedRoleID === 0">Select All</button>
            <button type="button" (click)="clearPermissions()" [disabled]="selectedRoleID === 0">Clear</button>
          </div>

          <div class="permission-box" *ngIf="selectedRoleID > 0">
            <div class="permission-group" *ngFor="let module of permissionModules">
              <h3>{{ niceName(module) }}</h3>

              <label class="check-row" *ngFor="let permission of permissionsByModule(module)">
                <input
                  type="checkbox"
                  [checked]="isPermissionSelected(permission.permissionID)"
                  (change)="togglePermission(permission.permissionID, $event)">
                <span>{{ actionName(permission.permissionName) }}</span>
                <small>{{ permission.permissionName }}</small>
              </label>
            </div>
          </div>

          <p class="hint" *ngIf="selectedRoleID === 0">Select a role first.</p>

          <button class="primary-btn full-btn" type="button" (click)="saveRolePermissions()" [disabled]="selectedRoleID === 0 || savingPerms">
            <span class="material-icons">save</span>
            {{ savingPerms ? 'Saving...' : 'Save Permissions' }}
          </button>

          <p *ngIf="permMsg" class="info-box">{{ permMsg }}</p>
        </div>

        <div class="panel">
          <div class="panel-title">
            <div>
              <h2>User Roles</h2>
              <span>Select person, tick role, then save.</span>
            </div>
          </div>

          <label>
            User
            <select name="selectedUserID" [(ngModel)]="selectedUserID" (ngModelChange)="loadUserRoles()">
              <option [ngValue]="0">Select user</option>
              <option *ngFor="let user of users" [ngValue]="user.userID">
                {{ user.username }} {{ user.email ? '(' + user.email + ')' : '' }}
              </option>
            </select>
          </label>

          <div class="role-box" *ngIf="selectedUserID > 0">
            <label class="check-row" *ngFor="let role of roles">
              <input
                type="checkbox"
                [checked]="isRoleSelected(role.roleID)"
                (change)="toggleUserRole(role.roleID, $event)">
              <span>{{ role.roleName }}</span>
              <small>Role ID: {{ role.roleID }}</small>
            </label>
          </div>

          <p class="hint" *ngIf="selectedUserID === 0">Select a user first.</p>
          <p class="hint">For safety, system will not let you change your own roles here.</p>

          <button class="primary-btn full-btn" type="button" (click)="saveUserRoles()" [disabled]="selectedUserID === 0 || savingRoles">
            <span class="material-icons">save</span>
            {{ savingRoles ? 'Saving...' : 'Save User Roles' }}
          </button>

          <p *ngIf="roleMsg" class="info-box">{{ roleMsg }}</p>
        </div>
      </div>

      <div class="panel">
        <div class="panel-title">
          <div>
            <h2>Direct User Permissions</h2>
            <span>Use this for special access. Allow gives extra access. Block removes access even if role has it.</span>
          </div>
        </div>

        <label>
          User
          <select name="permUserID" [(ngModel)]="permUserID" (ngModelChange)="loadDirectUserPerms()">
            <option [ngValue]="0">Select user</option>
            <option *ngFor="let user of users" [ngValue]="user.userID">
              {{ user.username }} {{ user.email ? '(' + user.email + ')' : '' }}
            </option>
          </select>
        </label>

        <div class="quick-actions">
          <button type="button" (click)="clearDirectPerms()" [disabled]="permUserID === 0">Clear Direct Permissions</button>
        </div>

        <div class="permission-box" *ngIf="permUserID > 0">
          <div class="permission-group" *ngFor="let module of permissionModules">
            <h3>{{ niceName(module) }}</h3>

            <div class="direct-row direct-head">
              <span>Permission</span>
              <span>Allow</span>
              <span>Block</span>
            </div>

            <div class="direct-row" *ngFor="let permission of permissionsByModule(module)">
              <div>
                <strong>{{ actionName(permission.permissionName) }}</strong>
                <small>{{ permission.permissionName }}</small>
              </div>

              <input
                type="checkbox"
                [checked]="isDirectAllowed(permission.permissionID)"
                (change)="toggleDirectPermission(permission.permissionID, 'allow', $event)">

              <input
                type="checkbox"
                [checked]="isDirectBlocked(permission.permissionID)"
                (change)="toggleDirectPermission(permission.permissionID, 'block', $event)">
            </div>
          </div>
        </div>

        <p class="hint" *ngIf="permUserID === 0">Select a user first.</p>
        <p class="hint">Example: HR role can stay normal, but one HR user can be allowed account.hr.view here.</p>

        <button class="primary-btn full-btn" type="button" (click)="saveDirectUserPerms()" [disabled]="permUserID === 0 || savingDirectPerms">
          <span class="material-icons">save</span>
          {{ savingDirectPerms ? 'Saving...' : 'Save Direct Permissions' }}
        </button>

        <p *ngIf="directPermMsg" class="info-box">{{ directPermMsg }}</p>
      </div>

      <p *ngIf="error" class="error-box">{{ error }}</p>

      <div class="panel">
        <div class="panel-title table-title">
          <div>
            <h2>Users</h2>
            <span>{{ filteredUsers.length }} shown</span>
          </div>
          <input class="search-box" placeholder="Search username, email, role" [(ngModel)]="searchText">
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>First Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of filteredUsers">
                <td>
                  <strong>{{ user.username }}</strong>
                  <small *ngIf="user.empID">Employee #{{ user.empID }}</small>
                </td>
                <td>{{ user.email || '-' }}</td>
                <td>{{ user.roles?.join(', ') || '-' }}</td>
                <td>
                  <span class="badge" [class.active]="user.isActive" [class.disabled]="!user.isActive">
                    {{ user.isActive ? 'Active' : 'Disabled' }}
                  </span>
                </td>
                <td>
                  <span class="badge" [class.warning]="user.mustChangePassword" [class.done]="!user.mustChangePassword">
                    {{ user.mustChangePassword ? 'Required' : 'Done' }}
                  </span>
                </td>
                <td class="actions">
                  <button type="button" (click)="setStatus(user, !user.isActive)">
                    <span class="material-icons">{{ user.isActive ? 'block' : 'check_circle' }}</span>
                    {{ user.isActive ? 'Disable' : 'Enable' }}
                  </button>
                  <button type="button" (click)="resetPassword(user.userID)">
                    <span class="material-icons">lock_reset</span>
                    Reset Password
                  </button>
                </td>
              </tr>

              <tr *ngIf="filteredUsers.length === 0">
                <td colspan="6" class="empty-row">No users found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .users-page { padding: 24px; display: grid; gap: 18px; color: #1f2937; }
    .page-header { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; }
    h1, h2, h3, p { margin: 0; }
    h1 { font-size: 28px; font-weight: 700; }
    h2 { font-size: 18px; font-weight: 700; }
    h3 { font-size: 14px; font-weight: 700; color: #334155; }
    p, .panel-title span, small, .hint { color: #64748b; }
    .stats-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
    .two-panels { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; align-items: start; }
    .stat-card, .panel { background: #fff; border: 1px solid #e2e8f0; border-radius: 18px; box-shadow: 0 14px 35px rgba(15, 23, 42, 0.07); }
    .stat-card { padding: 16px; display: grid; gap: 6px; }
    .stat-card span { color: #64748b; font-size: 13px; }
    .stat-card strong { font-size: 26px; }
    .panel { padding: 18px; display: grid; gap: 14px; }
    .panel-title { display: flex; justify-content: space-between; gap: 16px; align-items: center; }
    .table-title { align-items: end; }
    .create-form { display: grid; grid-template-columns: 1fr 1.4fr 180px auto; gap: 12px; align-items: end; }
    label { display: grid; gap: 6px; font-size: 13px; color: #475569; }
    input, select { min-height: 38px; border: 1px solid #cbd5e1; border-radius: 6px; padding: 0 10px; background: #fff; }
    input[type="checkbox"] { min-height: auto; width: 16px; height: 16px; padding: 0; }
    .search-box { width: 280px; }
    .primary-btn { min-height: 38px; border: 0; border-radius: 12px; padding: 0 16px; background: linear-gradient(135deg, #2563eb, #4f46e5); color: #fff; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 8px; }
    .primary-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .full-btn { width: 100%; }
    .quick-actions { display: flex; gap: 8px; }
    .quick-actions button, .actions button { min-height: 32px; border: 1px solid #cbd5e1; border-radius: 10px; background: #fff; color: #334155; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; padding: 0 10px; }
    .quick-actions button:disabled { opacity: 0.5; cursor: not-allowed; }
    .permission-box, .role-box { display: grid; gap: 12px; max-height: 420px; overflow: auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; background: #f8fafc; }
    .permission-group { display: grid; gap: 8px; padding-bottom: 10px; border-bottom: 1px solid #e2e8f0; }
    .permission-group:last-child { border-bottom: 0; padding-bottom: 0; }
    .check-row { grid-template-columns: 18px 1fr auto; align-items: center; gap: 8px; background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px; }
    .check-row span { font-weight: 600; color: #1f2937; }
    .direct-row { display: grid; grid-template-columns: 1fr 80px 80px; gap: 10px; align-items: center; background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px; }
    .direct-row strong, .direct-row small { display: block; }
    .direct-row input { justify-self: center; }
    .direct-head { background: #e2e8f0; color: #334155; font-weight: 700; font-size: 12px; text-transform: uppercase; }
    .error-box, .info-box { padding: 10px 12px; border-radius: 6px; }
    .error-box { border: 1px solid #fecaca; background: #fef2f2; color: #991b1b; }
    .info-box { border: 1px solid #bfdbfe; background: #eff6ff; color: #1e40af; }
    .table-wrap { overflow: auto; border: 1px solid #e2e8f0; border-radius: 8px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: left; white-space: nowrap; }
    th { background: #f8fafc; color: #475569; font-size: 12px; text-transform: uppercase; letter-spacing: 0; }
    td strong, td small { display: block; }
    .badge { display: inline-flex; align-items: center; min-height: 24px; border-radius: 999px; padding: 0 10px; font-size: 12px; font-weight: 700; }
    .badge.active, .badge.done { background: #dcfce7; color: #166534; }
    .badge.disabled { background: #fee2e2; color: #991b1b; }
    .badge.warning { background: #fef3c7; color: #92400e; }
    .actions { display: flex; gap: 8px; }
    .empty-row { text-align: center; color: #64748b; }
    @media (max-width: 1000px) {
      .page-header, .panel-title { display: grid; }
      .stats-grid, .create-form, .two-panels { grid-template-columns: 1fr; }
      .search-box { width: 100%; }
    }
  `],
})
export class UserManagementComponent implements OnInit {
  private readonly userUrl = `${API_BASE_URL}/api/users`;
  private readonly roleUrl = `${API_BASE_URL}/api/role`;
  private readonly permissionUrl = `${API_BASE_URL}/api/permission`;

  users: any[] = [];
  roles: any[] = [];
  permissions: any[] = [];

  selectedRoleID = 0;
  selectedPermissionIDs: number[] = [];

  selectedUserID = 0;
  selectedUserRoleIDs: number[] = [];

  permUserID = 0;
  allowPermissionIDs: number[] = [];
  blockPermissionIDs: number[] = [];

  saving = false;
  savingPerms = false;
  savingRoles = false;
  savingDirectPerms = false;
  error = '';
  permMsg = '';
  roleMsg = '';
  directPermMsg = '';
  searchText = '';

  model = { username: '', email: '', roleName: 'Admin' };

  constructor(
    private readonly http: HttpClient,
    private readonly authSession: AuthSessionService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  get activeCount(): number {
    return this.users.filter((user) => user.isActive).length;
  }

  get pendingPasswordCount(): number {
    return this.users.filter((user) => user.mustChangePassword).length;
  }

  get permissionModules(): string[] {
    const names: string[] = [];

    for (const permission of this.permissions) {
      const module = this.moduleName(permission.permissionName);

      if (!names.includes(module)) {
        names.push(module);
      }
    }

    return names.sort();
  }

  get filteredUsers(): any[] {
    const search = this.searchText.trim().toLowerCase();

    if (!search) {
      return this.users;
    }

    return this.users.filter((user) => {
      const roles = Array.isArray(user.roles)
        ? user.roles.join(' ')
        : '';

      return [
        user.username,
        user.email,
        roles,
      ].some((value) =>
        String(value ?? '').toLowerCase().includes(search)
      );
    });
  }

  load(): void {
    this.error = '';
    this.permMsg = '';
    this.roleMsg = '';
    this.directPermMsg = '';

    this.loadUsers();
    this.loadRoles();
    this.loadPermissions();
  }

  loadUsers(): void {
    this.http.get<any[]>(this.userUrl).subscribe({
      next: (users) => this.users = users,
      error: (error) => this.error = error?.error?.message ?? 'Users could not be loaded.',
    });
  }

  loadRoles(): void {
    this.http.get<any[]>(`${this.roleUrl}/${this.authSession.companyId}`).subscribe({
      next: (roles) => {
        this.roles = roles;

        if (this.selectedRoleID === 0 && roles.length > 0) {
          this.selectedRoleID = roles[0].roleID;
          this.loadRolePermissions();
        }
      },
      error: (error) => this.error = error?.error?.message ?? 'Roles could not be loaded.',
    });
  }

  loadPermissions(): void {
    this.http.get<any[]>(this.permissionUrl).subscribe({
      next: (permissions) => {
        this.permissions = permissions;

        if (this.selectedRoleID > 0) {
          this.loadRolePermissions();
        }
      },
      error: (error) => this.error = error?.error?.message ?? 'Permissions could not be loaded.',
    });
  }

  loadRolePermissions(): void {
    this.permMsg = '';
    this.selectedPermissionIDs = [];

    if (this.selectedRoleID === 0) {
      return;
    }

    this.http.get<any[]>(`${this.roleUrl}/permissions/${this.selectedRoleID}`).subscribe({
      next: (rows) => {
        this.selectedPermissionIDs = rows
          .map((row) => row.permissionID)
          .filter((permissionID) => this.isVisiblePermission(permissionID));
      },
      error: (error) => this.error = error?.error?.message ?? 'Role permissions could not be loaded.',
    });
  }

  loadUserRoles(): void {
    this.roleMsg = '';
    this.selectedUserRoleIDs = [];

    if (this.selectedUserID === 0) {
      return;
    }

    this.http.get<any[]>(`${this.roleUrl}/user/${this.selectedUserID}`).subscribe({
      next: (rows) => {
        this.selectedUserRoleIDs = rows.map((row) => row.roleID);
      },
      error: (error) => this.error = error?.error?.message ?? 'User roles could not be loaded.',
    });
  }

  loadDirectUserPerms(): void {
    this.directPermMsg = '';
    this.allowPermissionIDs = [];
    this.blockPermissionIDs = [];

    if (this.permUserID === 0) {
      return;
    }

    this.http.get<any[]>(`${this.roleUrl}/user-perms/${this.permUserID}`).subscribe({
      next: (rows) => {
        this.allowPermissionIDs = rows
          .filter((row) => row.isAllowed)
          .map((row) => row.permissionID);

        this.blockPermissionIDs = rows
          .filter((row) => !row.isAllowed)
          .map((row) => row.permissionID);
      },
      error: (error) => this.error = error?.error?.message ?? 'Direct permissions could not be loaded.',
    });
  }

  create(form: NgForm): void {
    if (form.invalid) return;

    this.saving = true;
    this.error = '';

    this.http.post(this.userUrl, this.model).subscribe({
      next: () => {
        this.saving = false;
        form.resetForm({ username: '', email: '', roleName: 'Admin' });
        this.loadUsers();
      },
      error: (error) => {
        this.saving = false;
        this.error = error?.error?.message ?? 'User creation failed.';
      },
    });
  }

  setStatus(user: any, isActive: boolean): void {
    this.http.put(`${this.userUrl}/${user.userID}/status`, { isActive }).subscribe({
      next: () => this.loadUsers(),
      error: (error) => this.error = error?.error?.message ?? 'Status update failed.',
    });
  }

  resetPassword(id: number): void {
    this.http.post(`${this.userUrl}/${id}/reset-password`, {}).subscribe({
      next: () => this.loadUsers(),
      error: (error) => this.error = error?.error?.message ?? 'Password reset failed.',
    });
  }

  permissionsByModule(module: string): any[] {
    return this.permissions
      .filter((permission) => this.moduleName(permission.permissionName) === module)
      .sort((a, b) => String(a.permissionName).localeCompare(String(b.permissionName)));
  }

  isPermissionSelected(permissionID: number): boolean {
    return this.selectedPermissionIDs.includes(permissionID);
  }

  togglePermission(permissionID: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;

    if (checked && !this.selectedPermissionIDs.includes(permissionID)) {
      this.selectedPermissionIDs = [...this.selectedPermissionIDs, permissionID];
      return;
    }

    if (!checked) {
      this.selectedPermissionIDs =
        this.selectedPermissionIDs.filter((id) => id !== permissionID);
    }
  }

  selectAllPermissions(): void {
    this.selectedPermissionIDs =
      this.permissions.map((permission) => permission.permissionID);
  }

  clearPermissions(): void {
    this.selectedPermissionIDs = [];
  }

  saveRolePermissions(): void {
    if (this.selectedRoleID === 0) return;

    this.savingPerms = true;
    this.error = '';
    this.permMsg = '';

    this.http.post(`${this.roleUrl}/permissions/save`, {
      roleID: this.selectedRoleID,
      permissionIDs: this.visiblePermissionIDs(this.selectedPermissionIDs),
    }).subscribe({
      next: () => {
        this.savingPerms = false;
        this.permMsg = 'Permissions saved. User must login again to get new token permissions.';
      },
      error: (error) => {
        this.savingPerms = false;
        this.error = error?.error?.message ?? 'Permissions could not be saved.';
      },
    });
  }

  visiblePermissionIDs(permissionIDs: number[]): number[] {
    return permissionIDs
      .filter((permissionID) => this.isVisiblePermission(permissionID));
  }

  isVisiblePermission(permissionID: number): boolean {
    return this.permissions
      .some((permission) => permission.permissionID === permissionID);
  }

  isRoleSelected(roleID: number): boolean {
    return this.selectedUserRoleIDs.includes(roleID);
  }

  toggleUserRole(roleID: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;

    if (checked && !this.selectedUserRoleIDs.includes(roleID)) {
      this.selectedUserRoleIDs = [...this.selectedUserRoleIDs, roleID];
      return;
    }

    if (!checked) {
      this.selectedUserRoleIDs =
        this.selectedUserRoleIDs.filter((id) => id !== roleID);
    }
  }

  saveUserRoles(): void {
    if (this.selectedUserID === 0) return;

    this.savingRoles = true;
    this.error = '';
    this.roleMsg = '';

    this.http.post(`${this.roleUrl}/user/save`, {
      userID: this.selectedUserID,
      roleIDs: this.selectedUserRoleIDs,
    }).subscribe({
      next: () => {
        this.savingRoles = false;
        this.roleMsg = 'User roles saved. User must login again to see new access.';
        this.loadUsers();
      },
      error: (error) => {
        this.savingRoles = false;
        this.error = error?.error?.message ?? 'User roles could not be saved.';
      },
    });
  }

  isDirectAllowed(permissionID: number): boolean {
    return this.allowPermissionIDs.includes(permissionID);
  }

  isDirectBlocked(permissionID: number): boolean {
    return this.blockPermissionIDs.includes(permissionID);
  }

  toggleDirectPermission(
    permissionID: number,
    mode: 'allow' | 'block',
    event: Event
  ): void {
    const checked = (event.target as HTMLInputElement).checked;

    if (mode === 'allow') {
      this.allowPermissionIDs = checked
        ? this.addId(this.allowPermissionIDs, permissionID)
        : this.removeId(this.allowPermissionIDs, permissionID);

      if (checked) {
        this.blockPermissionIDs =
          this.removeId(this.blockPermissionIDs, permissionID);
      }

      return;
    }

    this.blockPermissionIDs = checked
      ? this.addId(this.blockPermissionIDs, permissionID)
      : this.removeId(this.blockPermissionIDs, permissionID);

    if (checked) {
      this.allowPermissionIDs =
        this.removeId(this.allowPermissionIDs, permissionID);
    }
  }

  clearDirectPerms(): void {
    this.allowPermissionIDs = [];
    this.blockPermissionIDs = [];
  }

  saveDirectUserPerms(): void {
    if (this.permUserID === 0) return;

    this.savingDirectPerms = true;
    this.error = '';
    this.directPermMsg = '';

    this.http.post(`${this.roleUrl}/user-perms/save`, {
      userID: this.permUserID,
      allowPermissionIDs: this.allowPermissionIDs,
      blockPermissionIDs: this.blockPermissionIDs,
    }).subscribe({
      next: () => {
        this.savingDirectPerms = false;
        this.directPermMsg = 'Direct permissions saved. User must logout/login again.';
      },
      error: (error) => {
        this.savingDirectPerms = false;
        this.error = error?.error?.message ?? 'Direct permissions could not be saved.';
      },
    });
  }

  addId(list: number[], id: number): number[] {
    return list.includes(id) ? list : [...list, id];
  }

  removeId(list: number[], id: number): number[] {
    return list.filter((item) => item !== id);
  }

  moduleName(permissionName: string): string {
    return String(permissionName ?? 'other').split('.')[0] || 'other';
  }

  actionName(permissionName: string): string {
    const parts = String(permissionName ?? '').split('.');

    if (parts.length <= 1) {
      return permissionName;
    }

    return this.niceName(parts.slice(1).join(' '));
  }

  niceName(value: string): string {
    return String(value ?? '')
      .replace(/[-_.]/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
}
