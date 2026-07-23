import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthSessionService } from '../../../../core/services/auth-session.service';
import { EmployeeService } from '../../../employees/employee.service';
import { AssetService } from '../../services/asset.service';

@Component({
  selector: 'app-asset-allocation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './asset-allocation.component.html',
})
export class AssetAllocationComponent implements OnInit {
  private readonly assetService = inject(AssetService);
  private readonly employeeService = inject(EmployeeService);
  private readonly authSession = inject(AuthSessionService);

  assets: any[] = [];
  employees: any[] = [];
  allocations: any[] = [];
  message = '';
  saving = false;
  loading = false;

  assetSearch = '';
  employeeSearch = '';

  form: any = {
    assetID: null,
    empID: null,
    issuedOn: this.today(),
    note: '',
  };

  ngOnInit(): void {
    this.load();
  }

  get availableAssets(): any[] {
    return this.assets.filter(asset =>
      asset.isActive &&
      asset.status !== 'Allocated'
    );
  }

  load(): void {
    this.loading = true;
    this.message = '';

    this.assetService.getAll().subscribe({
      next: assets => {
        this.assets = assets || [];
        this.loading = false;
      },
      error: err => {
        this.loading = false;
        this.message = err?.error?.message ?? 'Assets could not be loaded.';
      }
    });

    this.employeeService.getAll(this.authSession.companyId).subscribe({
      next: employees => this.employees = employees || [],
    });

    this.assetService.getAllocations().subscribe({
      next: allocations => this.allocations = allocations || [],
    });
  }

  assetLabel(asset: any): string {
    return `${asset.assetCode} - ${asset.assetName}`;
  }

  employeeLabel(employee: any): string {
    const name = `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
    return `${employee.empCode} - ${name}`;
  }

  selectAsset(): void {
    const selected = this.availableAssets.find(asset =>
      this.assetLabel(asset).toLowerCase() === this.assetSearch.trim().toLowerCase()
    );

    this.form.assetID = selected ? selected.assetID : null;
  }

  selectEmployee(): void {
    const selected = this.employees.find(employee =>
      this.employeeLabel(employee).toLowerCase() === this.employeeSearch.trim().toLowerCase()
    );

    this.form.empID = selected ? selected.empID : null;
  }

  allocate(): void {
    if (!this.form.assetID || !this.form.empID) {
      this.message = 'Please select asset and employee.';
      return;
    }

    this.saving = true;
    this.message = '';

    this.assetService.allocate({
      assetID: this.form.assetID,
      empID: this.form.empID,
      issuedOn: this.form.issuedOn,
      note: this.form.note,
    }).subscribe({
      next: () => {
        this.saving = false;
        this.message = 'Asset allocated.';
        this.reset();
        this.load();
      },
      error: err => {
        this.saving = false;
        this.message = err?.error?.message ?? 'Allocation failed.';
      }
    });
  }

  returnAsset(allocation: any): void {
    const note = prompt('Return note, if any') || '';

    this.assetService.returnAsset(allocation.allocID, {
      returnedOn: new Date(),
      note,
    }).subscribe({
      next: () => {
        this.message = 'Asset returned.';
        this.load();
      },
      error: err => this.message = err?.error?.message ?? 'Return failed.',
    });
  }

  reset(): void {
    this.assetSearch = '';
    this.employeeSearch = '';
    this.form = {
      assetID: null,
      empID: null,
      issuedOn: this.today(),
      note: '',
    };
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
