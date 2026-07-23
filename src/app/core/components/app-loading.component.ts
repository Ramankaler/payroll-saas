import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LoadingService } from '../services/loading.service';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="app-loading" *ngIf="loading.loading$ | async">
      <div class="loader-card">
        <div class="loader"></div>
        <span>Loading data…</span>
      </div>
    </div>
  `,
  styles: [`
    .app-loading {
      position: fixed;
      inset: 0;
      z-index: 5000;
      display: grid;
      place-items: start center;
      padding-top: 76px;
      pointer-events: none;
      background: linear-gradient(
        180deg,
        rgba(15, 23, 42, 0.08),
        rgba(15, 23, 42, 0)
      );
    }

    .loader-card {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      min-height: 42px;
      padding: 0 14px;
      border: 1px solid #dbeafe;
      border-radius: 999px;
      background: #ffffff;
      color: #1e3a8a;
      box-shadow: 0 12px 28px rgba(15, 23, 42, 0.14);
      font-size: 13px;
      font-weight: 700;
    }

    .loader {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 3px solid #bfdbfe;
      border-top-color: #2563eb;
      animation: spin 0.7s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `],
})
export class AppLoadingComponent {
  constructor(public readonly loading: LoadingService) {}
}
