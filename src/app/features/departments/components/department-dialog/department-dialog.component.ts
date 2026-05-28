import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DepartmentService } from '../../services/department.service';

interface DialogData {
  isEdit?: boolean;
  dept?: { deptID: number; deptName: string; tag?: string };
}

@Component({
  selector: 'app-department-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule
  ],
  templateUrl: './department-dialog.component.html',
  styleUrls: ['./department-dialog.component.scss']
})
export class DepartmentDialogComponent {
  deptName = '';
  tag = '';
  isEdit = false;
  deptID: number | null = null;
  isSaving = false;
errorMessage = '';

  data = inject<DialogData>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<DepartmentDialogComponent>);
  private deptSrv = inject(DepartmentService);

  constructor() {
    if (this.data?.isEdit && this.data.dept) {
      this.isEdit = true;
      this.deptName = this.data.dept.deptName || '';
      this.tag = this.data.dept.tag || '';
      this.deptID = this.data.dept.deptID;
    }
  }

  generateTag(name: string): string {
    if (this.tag?.trim()) return this.tag.trim().toUpperCase();

    const words = name.trim().toUpperCase().split(/\s+/);
    return words.length === 1 ? words[0].slice(0, 2) : words.map(w => w[0]).join('');
  }

 save(): void {
  if (!this.deptName.trim()) return;

  this.isSaving = true;

  const payload = {
    compID: 1,
    deptName: this.deptName.trim(),
    tag: this.generateTag(this.deptName)
  };

  const request = this.isEdit && this.deptID
    ? this.deptSrv.update(this.deptID, payload)
    : this.deptSrv.create(payload);

  request.subscribe({
    next: () => {
      this.isSaving = false;

      this.dialogRef.close({
        deptID: this.deptID || Date.now(),
        deptName: payload.deptName,
        tag: payload.tag
      });
    },
error: (err) => {
  this.isSaving = false;

  this.errorMessage = err?.error || 'Something went wrong';

  console.error(err);
}
  });
}

  close(): void {
    this.dialogRef.close();
  }


  onNameChange() {
  this.errorMessage = '';
}
}

