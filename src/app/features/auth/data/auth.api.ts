import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_ROUTES } from '../../../core/config/api.config';

export interface LoginRequest {
  compID: number;
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresAtUtc: string;
  userID: number;
  compID: number;
  employeeID: number | null;
  username: string;
  mustChangePassword: boolean;
  roles: string[];
  permissions: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthApi {
  constructor(private readonly http: HttpClient) {}

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      API_ROUTES.login,
      request
    );
  }

  changePassword(request: {
    currentPassword: string;
    newPassword: string;
  }): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      API_ROUTES.changePassword,
      request
    );
  }
}
