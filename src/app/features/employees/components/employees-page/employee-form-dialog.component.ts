import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import type { EmployeeCreateRequest } from '../../data/employees.api';

@Component({
  selector: 'app-employee-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
  ],
  templateUrl: './employee-form-dialog.component.html',
  styleUrls: ['./employee-form-dialog.component.scss'],
})
export class EmployeeFormDialogComponent {
  fb = inject(FormBuilder);
  dialogRef = inject(MatDialogRef<EmployeeFormDialogComponent>);

  form = this.fb.group({
    employeeId: ['', Validators.required],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    gender: [''],
    dob: [''],
    joiningDate: ['', Validators.required],
    basicSalary: [0, [Validators.required, Validators.min(0)]],
    allowancesAmount: [0],
    workLocation: [''],
  });

  submit(): void {
    if (this.form.invalid) return;
    const v = this.form.value;
    this.dialogRef.close({
      employeeId: v.employeeId?.trim() ?? '',
      firstName: v.firstName?.trim() ?? '',
      lastName: v.lastName?.trim() ?? '',
      email: v.email?.trim() ?? '',
      phone: v.phone || null,
      gender: v.gender || null,
      dob: v.dob || null,
      joiningDate: v.joiningDate ?? new Date().toISOString().split('T')[0],
      basicSalary: v.basicSalary ?? 0,
      allowancesAmount: v.allowancesAmount ?? 0,
      workLocation: v.workLocation || null,
    } as EmployeeCreateRequest);
  }
}