import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthSessionService } from '../../../../core/services/auth-session.service';
import {
  Shift,
  ShiftRequest,
  ShiftService
} from '../../services/shift.service';

@Component({
  selector: 'app-shift-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shift-list.component.html'
})
export class ShiftListComponent {
  private readonly authSession = inject(AuthSessionService);
  private readonly shiftService = inject(ShiftService);

  shifts: Shift[] = [];
  isSaving = false;
  message = '';
  editingId: number | null = null;

  form = {
    shiftName: '',
    startTime: '09:00',
    endTime: '18:00',
    graceMinutes: 0,
    standardHours: 8
  };

  ngOnInit(): void {
    this.loadShifts();
  }

  loadShifts(): void {
    this.shiftService
      .getAll(this.authSession.companyId)
      .subscribe({
        next: shifts => {
          this.shifts = shifts;
        }
      });
  }

  save(): void {
    if (!this.form.shiftName.trim()) {
      this.message = 'Shift name is required.';
      return;
    }

    this.isSaving = true;
    this.message = '';

    const request: ShiftRequest = {
      shiftName: this.form.shiftName.trim(),
      startTime: this.toApiTime(this.form.startTime),
      endTime: this.toApiTime(this.form.endTime),
      graceMinutes: Number(this.form.graceMinutes || 0),
      standardHours: Number(this.form.standardHours || 8)
    };

    const action =
      this.editingId === null
        ? this.shiftService.create(request)
        : this.shiftService.update(this.editingId, request);

    action.subscribe({
      next: () => {
        this.isSaving = false;
        this.message = 'Shift saved.';
        this.reset();
        this.loadShifts();
      },
      error: err => {
        this.isSaving = false;
        this.message =
          err?.error?.message || 'Failed to save shift.';
      }
    });
  }

  edit(shift: Shift): void {
    this.editingId = shift.shiftID;
    this.form = {
      shiftName: shift.shiftName,
      startTime: this.toInputTime(shift.startTime),
      endTime: this.toInputTime(shift.endTime),
      graceMinutes: shift.graceMinutes,
      standardHours: shift.standardHours
    };
  }

  toggleStatus(shift: Shift): void {
    this.shiftService
      .updateStatus(shift.shiftID, !shift.isActive)
      .subscribe({
        next: () => this.loadShifts()
      });
  }

  reset(): void {
    this.editingId = null;
    this.form = {
      shiftName: '',
      startTime: '09:00',
      endTime: '18:00',
      graceMinutes: 0,
      standardHours: 8
    };
  }

  private toApiTime(value: string): string {
    if (!value) {
      return '00:00:00';
    }

    return value.length === 5 ? `${value}:00` : value;
  }

  private toInputTime(value: string): string {
    return value?.substring(0, 5) || '00:00';
  }
}
