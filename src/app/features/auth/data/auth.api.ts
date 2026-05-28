import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_ROUTES } from '../../../core/config/api.config';
import { Observable } from 'rxjs';

export interface LoginRequest {
  compID: string;
  email: string;
  PasswordHash: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface LoginResponse {
  // accessToken: string;
  refreshToken: string;
  accessTokenExpiresAtUtc: string;
  // compID: number;
  // userId: string;
  roles: string[];
  permissions: string[];
    token: string;
  userID: number;
  compID: number;
}

export interface RegisterRequest {
  companyName: string;
  companyCurrency: string;
  country: string;
  timezone: string;
  payrollCycle: string;
  adminEmail: string;
  adminPassword: string;
  adminFirstName?: string | null;
  adminLastName?: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthApi {
  constructor(private readonly http: HttpClient) {}

  login(req: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(API_ROUTES.login, req);
  }

  refresh(req: RefreshRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(API_ROUTES.refresh, req);
  }

  register(req: RegisterRequest): Observable<void> {
    return this.http.post<void>(API_ROUTES.register, req);
  }
}

