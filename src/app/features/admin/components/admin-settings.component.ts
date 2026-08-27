import { Component, OnInit, inject } from '@angular/core';
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
export class AdminSettingsComponent implements OnInit {
  private readonly http = inject(HttpClient);

  req = {
    payrollCycle: 'Monthly',
    workingDays: 5,
    probationMonths: 6,
    noticeDays: 30,
    otRate: 1.25,
    lateGraceMin: 10,
    earlyGraceMin: 10,
    gatePassLimitMin: 240,
    gatePassMinMin: 10,
    gatePassMaxMin: 240,
    currency: 'AED',
    timezone: 'Asia/Dubai',
  };
  result: any | null = null;
  loading = false;
  saving = false;

  ngOnInit(): void {
    this.loading = true;

    this.http.get<any>(API_ROUTES.adminSettings).subscribe({
      next: (settings) => {
        this.req = {
          payrollCycle: settings?.payrollCycle ?? 'Monthly',
          workingDays: settings?.workingDays ?? 5,
          probationMonths: settings?.probationMonths ?? 6,
          noticeDays: settings?.noticeDays ?? 30,
          otRate: settings?.otRate ?? 1.25,
          lateGraceMin: settings?.lateGraceMin ?? 10,
          earlyGraceMin: settings?.earlyGraceMin ?? 10,
          gatePassLimitMin: settings?.gatePassLimitMin ?? 240,
          gatePassMinMin: settings?.gatePassMinMin ?? 10,
          gatePassMaxMin: settings?.gatePassMaxMin ?? 240,
          currency: settings?.currency ?? 'AED',
          timezone: settings?.timezone ?? 'Asia/Dubai',
        };
        this.result = settings;
        this.loading = false;
      },
      error: (err) => {
        this.result = { error: err?.error?.message ?? 'Settings could not be loaded.' };
        this.loading = false;
      },
    });
  }

  save() {
    this.saving = true;

    this.http.put<any>(API_ROUTES.adminSettings, this.req).subscribe({
      next: (r) => {
        this.result = r ?? { ok: true };
        this.saving = false;
      },
      error: (err) => {
        this.result = { error: err?.error?.message ?? err?.error ?? 'Update failed' };
        this.saving = false;
      },
    });
  }
}
