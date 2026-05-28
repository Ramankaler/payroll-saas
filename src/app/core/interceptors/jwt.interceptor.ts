import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.getAccessToken();
    if (!token) return next.handle(req);

    const isApi = req.url.startsWith(API_BASE_URL);
    if (!isApi) return next.handle(req);

    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next.handle(authReq);
  }

  private getAccessToken(): string | null {
    try {
      const raw = localStorage.getItem('auth');
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { accessToken?: string | null };
      return parsed.accessToken ?? null;
    } catch {
      return null;
    }
  }
}

