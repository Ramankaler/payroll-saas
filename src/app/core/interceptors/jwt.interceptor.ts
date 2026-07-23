import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../config/api.config';

interface StoredAuthentication {
  accessToken?: string | null;
  expiresAtUtc?: string | null;
}

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const requestIsForApi =
      request.url.startsWith(API_BASE_URL);

    if (!requestIsForApi) {
      return next.handle(request);
    }

    const accessToken = this.getValidAccessToken();

    if (!accessToken) {
      return next.handle(request);
    }

    const authenticatedRequest = request.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return next.handle(authenticatedRequest);
  }

  private getValidAccessToken(): string | null {
    try {
      const raw = localStorage.getItem('auth');

      if (!raw) {
        return null;
      }

      const authentication =
        JSON.parse(raw) as StoredAuthentication;

      if (
        !authentication.accessToken ||
        !authentication.expiresAtUtc
      ) {
        localStorage.removeItem('auth');
        return null;
      }

      const expirationTime =
        Date.parse(authentication.expiresAtUtc);

      const tokenIsExpired =
        !Number.isFinite(expirationTime) ||
        expirationTime <= Date.now();

      if (tokenIsExpired) {
        localStorage.removeItem('auth');
        return null;
      }

      return authentication.accessToken;
    } catch {
      localStorage.removeItem('auth');
      return null;
    }
  }
}
