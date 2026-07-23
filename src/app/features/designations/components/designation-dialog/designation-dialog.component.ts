import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DesignationService } from '../../services/designation.service';
import { AuthSessionService } from '../../../../core/services/auth-session.service';

interface DialogData {
  isEdit?: boolean;
  desig?: { desigID: number; desigName: string; tag?: string };
}

@Component({
  selector: 'app-designation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule
  ],
  templateUrl: `./designation-dialog.component.html`,
  styleUrls: [`./designation-dialog.component.scss`]
})
export class DesignationDialogComponent {
  private readonly authSession =  inject(AuthSessionService);
  desigName = '';
  tag = '';
  isEdit = false;
  desigID: number | null = null;
  isSaving = false;
errorMessage = '';

  data = inject<DialogData>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<DesignationDialogComponent>);
  private desigSrv = inject(DesignationService);

  constructor() {
    if (this.data?.isEdit && this.data.desig) {
      this.isEdit = true;
      this.desigName = this.data.desig.desigName || '';
      this.tag = this.data.desig.tag || '';
      this.desigID = this.data.desig.desigID;
    }
  }

  generateTag(name: string): string {
    if (this.tag?.trim()) return this.tag.trim().toUpperCase();

    const words = name.trim().toUpperCase().split(/\s+/);
    return words.length === 1 ? words[0].slice(0, 2) : words.map(w => w[0]).join('');
  }

 save(): void {
  if (!this.desigName.trim()) return;

  this.isSaving = true;

  const payload = {
    compID: this.authSession.companyId,
    desigName: this.desigName.trim(),
    tag: this.generateTag(this.desigName)
  };

  const request = this.isEdit && this.desigID
    ? this.desigSrv.update(this.desigID, payload)
    : this.desigSrv.create(payload);

  request.subscribe({
    next: () => {
      this.isSaving = false;
      this.dialogRef.close({
        desigID: this.desigID || Date.now(),
        desigName: payload.desigName,
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

clearError() {
  this.errorMessage = '';
}

  close(): void {
    this.dialogRef.close();
  }
}

