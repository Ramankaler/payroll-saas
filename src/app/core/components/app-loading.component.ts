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
        <div class="loader-row">
          <div class="loader"></div>
          <span>Loading data…</span>
        </div>

        <div class="skeleton-lines" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </div>
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
      width: min(420px, calc(100vw - 32px));
      display: grid;
      gap: 10px;
      min-height: 92px;
      padding: 14px;
      border: 1px solid #dbeafe;
      border-radius: 18px;
      background: #ffffff;
      color: #1e3a8a;
      box-shadow: 0 12px 28px rgba(15, 23, 42, 0.14);
      font-size: 13px;
      font-weight: 700;
    }

    .loader-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .loader {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 3px solid #bfdbfe;
      border-top-color: #2563eb;
      animation: spin 0.7s linear infinite;
    }

    .skeleton-lines {
      display: grid;
      gap: 7px;
    }

    .skeleton-lines span {
      display: block;
      height: 10px;
      border-radius: 999px;
      background: linear-gradient(
        90deg,
        #eff6ff 0%,
        #dbeafe 50%,
        #eff6ff 100%
      );
      background-size: 200% 100%;
      animation: shimmer 1.1s ease-in-out infinite;
    }

    .skeleton-lines span:nth-child(1) {
      width: 86%;
    }

    .skeleton-lines span:nth-child(2) {
      width: 64%;
    }

    .skeleton-lines span:nth-child(3) {
      width: 76%;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @keyframes shimmer {
      0% { background-position: 100% 0; }
      100% { background-position: -100% 0; }
    }
  `],
})
export class AppLoadingComponent {
  constructor(public readonly loading: LoadingService) {}
}
