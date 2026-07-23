import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
} from '@angular/router';

interface StoredAuthentication {
  accessToken?: string | null;
  expiresAtUtc?: string | null;
  mustChangePassword?: boolean;
}

export const authGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);

  try {
    const raw = localStorage.getItem('auth');

    if (!raw) {
      return router.createUrlTree(['/login']);
    }

    const authentication =
      JSON.parse(raw) as StoredAuthentication;

    if (
      !authentication.accessToken ||
      !authentication.expiresAtUtc
    ) {
      localStorage.removeItem('auth');

      return router.createUrlTree(['/login']);
    }

    const expirationTime =
      Date.parse(authentication.expiresAtUtc);

    const tokenIsExpired =
      !Number.isFinite(expirationTime) ||
      expirationTime <= Date.now();

    if (tokenIsExpired) {
      localStorage.removeItem('auth');

      return router.createUrlTree(['/login']);
    }

    if (
      authentication.mustChangePassword === true &&
      state.url !== '/change-password'
    ) {
      return router.createUrlTree(['/change-password']);
    }

    if (
      authentication.mustChangePassword !== true &&
      state.url === '/change-password'
    ) {
      return router.createUrlTree(['/dashboard']);
    }

    return true;
  } catch {
    localStorage.removeItem('auth');

    return router.createUrlTree(['/login']);
  }
};
