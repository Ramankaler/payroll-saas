import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AssetService } from '../../services/asset.service';

@Component({
  selector: 'app-asset-allocation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './asset-allocation.component.html',
})
export class AssetAllocationComponent implements OnInit {
  private readonly assetService = inject(AssetService);

  assetOptions: any[] = [];
  employeeOptions: any[] = [];
  allocations: any[] = [];
  message = '';
  saving = false;
  loading = false;
  loadingAssets = false;
  loadingEmployees = false;

  assetSearch = '';
  employeeSearch = '';
  allocationSearch = '';
  allocationStatus = 'Issued';
  page = 1;
  pageSize = 25;
  totalRecords = 0;

  private assetSearchTimer: any = null;
  private employeeSearchTimer: any = null;

  form: any = {
    assetID: null,
    empID: null,
    issuedOn: this.today(),
    note: '',
  };

  ngOnInit(): void {
    this.load();
    this.loadAssetOptions();
    this.loadEmployeeOptions();
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalRecords / this.pageSize));
  }

  load(): void {
    this.loading = true;
    this.message = '';

    this.assetService
      .getAllocations(
        this.page,
        this.pageSize,
        this.allocationSearch,
        this.allocationStatus
      )
      .subscribe({
        next: result => {
          this.allocations = result?.data || [];
          this.totalRecords = result?.totalRecords || 0;
          this.loading = false;
        },
        error: err => {
          this.loading = false;
          this.message = err?.error?.message ?? 'Allocations could not be loaded.';
        }
      });
  }

  loadAssetOptions(): void {
    this.loadingAssets = true;

    this.assetService.searchAvailable(this.assetSearch).subscribe({
      next: assets => {
        this.assetOptions = assets || [];
        this.loadingAssets = false;
      },
      error: () => {
        this.assetOptions = [];
        this.loadingAssets = false;
      }
    });
  }

  loadEmployeeOptions(): void {
    this.loadingEmployees = true;

    this.assetService.searchEmployees(this.employeeSearch).subscribe({
      next: employees => {
        this.employeeOptions = employees || [];
        this.loadingEmployees = false;
      },
      error: () => {
        this.employeeOptions = [];
        this.loadingEmployees = false;
      }
    });
  }

  onAssetSearchChanged(): void {
    this.form.assetID = null;

    if (this.assetSearchTimer) {
      clearTimeout(this.assetSearchTimer);
    }

    this.assetSearchTimer = setTimeout(() => {
      this.loadAssetOptions();
    }, 300);
  }

  onEmployeeSearchChanged(): void {
    this.form.empID = null;

    if (this.employeeSearchTimer) {
      clearTimeout(this.employeeSearchTimer);
    }

    this.employeeSearchTimer = setTimeout(() => {
      this.loadEmployeeOptions();
    }, 300);
  }

  searchAllocations(): void {
    this.page = 1;
    this.load();
  }

  nextPage(): void {
    if (this.page >= this.totalPages) {
      return;
    }

    this.page++;
    this.load();
  }

  previousPage(): void {
    if (this.page <= 1) {
      return;
    }

    this.page--;
    this.load();
  }

  changePageSize(): void {
    this.page = 1;
    this.load();
  }

  assetLabel(asset: any): string {
    const serial = asset.serialNo ? ` (${asset.serialNo})` : '';
    return `${asset.assetCode} - ${asset.assetName}${serial}`;
  }

  employeeLabel(employee: any): string {
    const name = `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
    return `${employee.empCode} - ${name}`;
  }

  selectAsset(): void {
    const selected = this.assetOptions.find(asset =>
      this.assetLabel(asset).toLowerCase() === this.assetSearch.trim().toLowerCase()
    );

    this.form.assetID = selected ? selected.assetID : null;
  }

  selectEmployee(): void {
    const selected = this.employeeOptions.find(employee =>
      this.employeeLabel(employee).toLowerCase() === this.employeeSearch.trim().toLowerCase()
    );

    this.form.empID = selected ? selected.empID : null;
  }

  allocate(): void {
    this.selectAsset();
    this.selectEmployee();

    if (!this.form.assetID || !this.form.empID) {
      this.message = 'Please select asset and employee from the search list.';
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
        this.loadAssetOptions();
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
        this.loadAssetOptions();
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

    this.loadAssetOptions();
    this.loadEmployeeOptions();
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
