import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BranchService } from '../../../branches/services/branch.service';
import { AuthSessionService } from '../../../../core/services/auth-session.service';
import { AssetService } from '../../services/asset.service';

@Component({
  selector: 'app-asset-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './asset-details.component.html',
})
export class AssetDetailsComponent implements OnInit {
  private readonly assetService = inject(AssetService);
  private readonly branchService = inject(BranchService);
  private readonly authSession = inject(AuthSessionService);

  assets: any[] = [];
  branches: any[] = [];
  searchText = '';
  message = '';
  loading = false;
  saving = false;
  editingId: number | null = null;
  page = 1;
  pageSize = 25;
  totalRecords = 0;

  form: any = this.emptyForm();

  ngOnInit(): void {
    this.load();
    this.branchService.getAll(this.authSession.companyId).subscribe({
      next: branches => this.branches = branches || [],
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalRecords / this.pageSize));
  }

  load(): void {
    this.loading = true;
    this.message = '';

    this.assetService.getPage(this.page, this.pageSize, this.searchText).subscribe({
      next: result => {
        this.assets = result?.data || [];
        this.totalRecords = result?.totalRecords || 0;
        this.loading = false;
      },
      error: err => {
        this.loading = false;
        this.message = err?.error?.message ?? 'Assets could not be loaded.';
      }
    });
  }

  searchAssets(): void {
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

  save(): void {
    if (!this.form.assetName?.trim()) {
      this.message = 'Asset name is required.';
      return;
    }

    this.saving = true;
    this.message = '';

    const request = this.editingId
      ? this.assetService.update(this.editingId, this.form)
      : this.assetService.create(this.form);

    request.subscribe({
      next: () => {
        this.saving = false;
        this.message = this.editingId
          ? 'Asset updated.'
          : 'Asset created.';
        this.reset();
        this.load();
      },
      error: err => {
        this.saving = false;
        this.message = err?.error?.message ?? 'Asset save failed.';
      }
    });
  }

  edit(asset: any): void {
    this.editingId = asset.assetID;
    this.form = {
      assetCode: asset.assetCode,
      assetName: asset.assetName,
      category: asset.category,
      brand: asset.brand,
      modelNo: asset.modelNo,
      serialNo: asset.serialNo,
      purchaseDate: this.toDateInput(asset.purchaseDate),
      cost: asset.cost,
      branchID: asset.branchID,
      location: asset.location,
      status: asset.status,
      condition: asset.condition,
      notes: asset.notes,
    };
  }

  reset(): void {
    this.editingId = null;
    this.form = this.emptyForm();
  }

  toggleStatus(asset: any): void {
    this.assetService.updateStatus(asset.assetID, !asset.isActive).subscribe({
      next: () => this.load(),
      error: err => this.message = err?.error?.message ?? 'Status update failed.',
    });
  }

  onBranchChange(): void {
    const branch = this.branches.find(item =>
      Number(item.branchID) === Number(this.form.branchID)
    );

    this.form.location = branch?.location || branch?.branchName || '';
  }

  private emptyForm(): any {
    return {
      assetCode: '',
      assetName: '',
      category: '',
      brand: '',
      modelNo: '',
      serialNo: '',
      purchaseDate: '',
      cost: null,
      branchID: null,
      location: '',
      status: 'Available',
      condition: 'Good',
      notes: '',
    };
  }

  private toDateInput(value: string | null): string {
    if (!value) {
      return '';
    }

    return value.split('T')[0];
  }
}
