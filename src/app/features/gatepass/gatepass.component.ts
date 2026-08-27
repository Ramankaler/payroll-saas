import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthSessionService } from '../../core/services/auth-session.service';
import { EmployeeService } from '../employees/employee.service';
import { GatePassService } from './gatepass.service';

@Component({
  selector: 'app-gatepass',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gatepass.component.html',
  styleUrls: ['./gatepass.component.scss'],
})
export class GatePassComponent implements OnInit {
  private readonly authSession = inject(AuthSessionService);
  private readonly employeeService = inject(EmployeeService);
  private readonly gatePassService = inject(GatePassService);

  employees: any[] = [];
  gatePasses: any[] = [];

  employeeSearch = '';
  loading = false;
  loadingEmployees = false;
  saving = false;
  message = '';
  editingId: number | null = null;
  totalRecords = 0;
  private employeeSearchTimer: any = null;

  statusList = [
    '',
    'Pending',
    'Approved',
    'Rejected',
    'Cancelled',
  ];

  filters: any = {
    empID: null,
    status: '',
    from: '',
    to: '',
    search: '',
    page: 1,
    pageSize: 25,
  };

  form: any = this.emptyForm();

  ngOnInit(): void {
    this.setCurrentMonth();
    this.loadEmployees();
    this.load();
  }

  loadEmployees(): void {
    this.loadingEmployees = true;

    this.employeeService
      .lookup(this.employeeSearch, 20)
      .subscribe({
        next: (rows) => {
          this.employees = rows ?? [];
          this.loadingEmployees = false;
        },
        error: (error) => {
          this.loadingEmployees = false;
          this.message =
            error?.error?.message ??
            'Employees could not be loaded.';
        },
      });
  }

  onEmployeeSearchChanged(): void {
    if (this.employeeSearchTimer) {
      clearTimeout(this.employeeSearchTimer);
    }

    this.employeeSearchTimer = setTimeout(() => {
      this.loadEmployees();
    }, 300);
  }

  load(): void {
    this.loading = true;
    this.message = '';

    this.gatePassService
      .getAll(this.authSession.companyId, this.filters)
      .subscribe({
        next: (result) => {
          this.gatePasses = result?.data || [];
          this.totalRecords = result?.totalRecords || 0;
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.message =
            error?.error?.message ??
            'Gate passes could not be loaded.';
        },
      });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalRecords / this.filters.pageSize));
  }

  searchGatePasses(): void {
    this.filters.page = 1;
    this.load();
  }

  changePageSize(): void {
    this.filters.page = 1;
    this.load();
  }

  previousPage(): void {
    if (this.filters.page <= 1) {
      return;
    }

    this.filters.page--;
    this.load();
  }

  nextPage(): void {
    if (this.filters.page >= this.totalPages) {
      return;
    }

    this.filters.page++;
    this.load();
  }

  save(): void {
    if (!this.form.empID) {
      this.message = 'Employee is required.';
      return;
    }

    if (!this.form.outTime) {
      this.message = 'Out time is required.';
      return;
    }

    if (!this.form.reason?.trim()) {
      this.message = 'Reason is required.';
      return;
    }

    const data = {
      empID: Number(this.form.empID),
      outTime: this.form.outTime,
      expectedInTime: this.form.expectedInTime || null,
      reason: this.form.reason.trim(),
      remarks: this.form.remarks?.trim() || null,
    };

    this.saving = true;
    this.message = '';

    const request = this.editingId
      ? this.gatePassService.update(this.editingId, data)
      : this.gatePassService.create(data);

    request.subscribe({
      next: () => {
        this.saving = false;
        this.message = this.editingId
          ? 'Gate pass updated.'
          : 'Gate pass created.';
        this.reset();
        this.load();
      },
      error: (error) => {
        this.saving = false;
        this.message =
          error?.error?.message ??
          'Gate pass save failed.';
      },
    });
  }

  edit(pass: any): void {
    this.editingId = pass.gatePassID;
    this.form = {
      empID: pass.empID,
      outTime: this.toDateTimeInput(pass.outTime),
      expectedInTime: this.toDateTimeInput(pass.expectedInTime),
      reason: pass.reason,
      remarks: pass.remarks || '',
    };
  }

  approve(pass: any): void {
    const remarks = window.prompt('Approval remarks (optional):') ?? '';
    this.gatePassService.approve(pass.gatePassID, remarks).subscribe({
      next: () => {
        this.message = 'Gate pass approved.';
        this.load();
      },
      error: (error) => {
        this.message =
          error?.error?.message ??
          'Approval failed.';
      },
    });
  }

  reject(pass: any): void {
    const remarks = window.prompt('Reject reason (optional):') ?? '';
    this.gatePassService.reject(pass.gatePassID, remarks).subscribe({
      next: () => {
        this.message = 'Gate pass rejected.';
        this.load();
      },
      error: (error) => {
        this.message =
          error?.error?.message ??
          'Reject failed.';
      },
    });
  }

  cancel(pass: any): void {
    if (!confirm('Cancel this gate pass?')) {
      return;
    }

    this.gatePassService.cancel(pass.gatePassID).subscribe({
      next: () => {
        this.message = 'Gate pass cancelled.';
        this.load();
      },
      error: (error) => {
        this.message =
          error?.error?.message ??
          'Cancel failed.';
      },
    });
  }

  markOut(pass: any): void {
    this.gatePassService.markOut(pass.gatePassID).subscribe({
      next: () => {
        this.message = 'Actual out time saved.';
        this.load();
      },
      error: (error) => {
        this.message =
          error?.error?.message ??
          'Out time save failed.';
      },
    });
  }

  markIn(pass: any): void {
    this.gatePassService.markIn(pass.gatePassID).subscribe({
      next: () => {
        this.message = 'Actual in time saved.';
        this.load();
      },
      error: (error) => {
        this.message =
          error?.error?.message ??
          'In time save failed.';
      },
    });
  }

  reset(): void {
    this.editingId = null;
    this.form = this.emptyForm();
  }

  isPending(pass: any): boolean {
    return pass.status === 'Pending';
  }

  canMarkOut(pass: any): boolean {
    return pass.status === 'Approved' && !pass.actualOutTime;
  }

  canMarkIn(pass: any): boolean {
    return pass.status === 'Approved' &&
      !!pass.actualOutTime &&
      !pass.actualInTime;
  }

  statusClass(status: string): string {
    return `status-${String(status || '').toLowerCase()}`;
  }

  private emptyForm(): any {
    return {
      empID: null,
      outTime: '',
      expectedInTime: '',
      reason: '',
      remarks: '',
    };
  }

  private setCurrentMonth(): void {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    this.filters.from = this.toDateInput(firstDay);
    this.filters.to = this.toDateInput(lastDay);
  }

  private toDateInput(value: Date): string {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private toDateTimeInput(value: string | null): string {
    if (!value) {
      return '';
    }

    return value.substring(0, 16);
  }
}
