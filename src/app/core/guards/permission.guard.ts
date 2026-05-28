import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { inject } from '@angular/core';

export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);

  const requiredPermission = route.data?.['requiredPermission'] as string | undefined;
  if (!requiredPermission) return true;

  try {
    const raw = localStorage.getItem('auth');
    const parsed = raw ? (JSON.parse(raw) as { permissions?: string[] }) : null;
    const permissions = parsed?.permissions ?? [];

    if (permissions.includes(requiredPermission)) return true;
  } catch {
    // ignore
  }

  router.navigate(['dashboard']);
  return false;
};

