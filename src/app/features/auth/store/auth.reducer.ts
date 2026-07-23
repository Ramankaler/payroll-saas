import { createReducer, on } from '@ngrx/store';

import {
  loginFailed,
  loginRequested,
  loginSucceeded,
  logout,
} from './auth.actions';

import {
  initialAuthState,
  type AuthState,
} from './auth.state';

export const authFeatureKey = 'auth';

export const authReducer = createReducer(
  initialAuthState,

  on(loginRequested, (state): AuthState => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(loginSucceeded, (state, { response }): AuthState => {
    const next: AuthState = {
      ...state,
      accessToken: response.accessToken,
      tokenType: response.tokenType,
      expiresAtUtc: response.expiresAtUtc,
      roles: response.roles,
      permissions: response.permissions,
      compID: response.compID,
      userID: response.userID,
      employeeID: response.employeeID,
      username: response.username,
      mustChangePassword: response.mustChangePassword,
      loading: false,
      error: null,
    };

    localStorage.setItem('auth', JSON.stringify(next));

    return next;
  }),

  on(loginFailed, (state, { error }): AuthState => ({
    ...state,
    loading: false,
    error,
  })),

  on(logout, (): AuthState => {
    localStorage.removeItem('auth');

    return {
      ...initialAuthState,
    };
  })
);
