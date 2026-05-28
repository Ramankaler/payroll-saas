import { createAction, props } from '@ngrx/store';
import type { LoginRequest, LoginResponse } from '../data/auth.api';

export const loginRequested = createAction(
  '[Auth] Login Requested',
  props<{ request: LoginRequest }>()
);

export const loginSucceeded = createAction(
  '[Auth] Login Succeeded',
  props<{ response: LoginResponse }>()
);

export const loginFailed = createAction(
  '[Auth] Login Failed',
  props<{ error: string }>()
);

export const logout = createAction('[Auth] Logout');

