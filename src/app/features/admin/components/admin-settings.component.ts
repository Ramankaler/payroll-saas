import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { API_ROUTES } from '../../../core/config/api.config';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './admin-settings.component.html',
  styleUrls: ['./admin-settings.component.scss'],
})
export class AdminSettingsComponent {
  private readonly http = inject(HttpClient);

  req = { payrollCycle: 'Monthly', workingDays: 5, currency: 'USD', timezone: 'UTC' };
  result: any | null = null;

  save() {
    this.http.put<any>(API_ROUTES.adminSettings, this.req).subscribe({
      next: (r) => (this.result = r ?? { ok: true }),
      error: (err) => (this.result = { error: err?.error ?? 'Update failed' }),
    });
  }
}
