import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthApi } from '../../data/auth.api';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './change-password.component.html',
})
export class ChangePasswordComponent {
  private readonly api = inject(AuthApi);
  private readonly router = inject(Router);

  model = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  loading = false;
  error = '';

  submit(form: NgForm): void {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    if (this.model.newPassword !== this.model.confirmPassword) {
      this.error = 'New passwords do not match.';
      return;
    }

    this.loading = true;
    this.error = '';

    this.api.changePassword({
      currentPassword: this.model.currentPassword,
      newPassword: this.model.newPassword,
    }).subscribe({
      next: () => {
        localStorage.removeItem('auth');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.loading = false;
        this.error =
          error?.error?.message ?? 'Password change failed.';
      },
    });
  }
}
