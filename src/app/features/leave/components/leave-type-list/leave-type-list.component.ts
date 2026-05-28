import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LeaveTypeService, LeaveTypeDto } from '../../services/leave-type.service';

@Component({
  selector: 'app-leave-type-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatSnackBarModule],
  templateUrl: './leave-type-list.component.html',
  styleUrls: ['./leave-type-list.component.scss']
})
export class LeaveTypeListComponent implements OnInit {
  leaveTypes: LeaveTypeDto[] = [];
  filteredTypes: LeaveTypeDto[] = [];
  newTypeName = '';
  searchTerm = '';
  compId = 1;

  constructor(
    private leaveTypeService: LeaveTypeService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadTypes();
  }

  loadTypes(): void {
    this.leaveTypeService.getAll(this.compId).subscribe({
      next: (types) => {
        this.leaveTypes = types;
        this.filteredTypes = [...types];
      }
    });
  }

  addType(): void {
    if (this.newTypeName.trim()) {
      this.leaveTypeService.create({ compID: this.compId, leaveTypeName: this.newTypeName.trim() }).subscribe({
        next: () => {
          this.newTypeName = '';
          this.loadTypes();
          this.snackBar.open('Leave type added', 'Close', { duration: 3000 });
        }
      });
    }
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredTypes = this.leaveTypes.filter(type =>
      type.leaveName.toLowerCase().includes(term)
    );
  }

  deleteType(id: number): void {
    if (confirm('Delete this leave type?')) {
      this.leaveTypeService.delete(id).subscribe({
        next: () => {
          this.loadTypes();
          this.snackBar.open('Leave type deleted', 'Close', { duration: 3000 });
        },
        error: () => this.snackBar.open('Delete failed', 'Close')
      });
    }
  }
}

