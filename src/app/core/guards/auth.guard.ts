import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  try {
    const raw = localStorage.getItem('auth');
    const parsed = raw ? (JSON.parse(raw) as { accessToken?: string | null }) : null;
    const hasToken = !!parsed?.accessToken;
    if (hasToken) return true;
  } catch {
    // ignore
  }
  router.navigate(['login']);
  return false;
};

