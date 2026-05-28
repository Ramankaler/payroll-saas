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
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
})
export class ReportsComponent {
  private readonly http = inject(HttpClient);

  fromUtc = '';
  toUtc = '';
  result: any | null = null;

  load() {
    const params = { fromUtc: this.fromUtc, toUtc: this.toUtc };
    this.http.get<any[]>(API_ROUTES.reportsAttendance, { params: params as any }).subscribe({
      next: (r) => (this.result = r),
      error: (err) => (this.result = { error: err?.error ?? 'Request failed' }),
    });
  }
}
