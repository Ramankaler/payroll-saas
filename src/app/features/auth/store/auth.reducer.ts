import { createReducer, on } from '@ngrx/store';
import { initialAuthState, type AuthState } from './auth.state';
import { loginFailed, loginRequested, loginSucceeded, logout } from './auth.actions';

export const authFeatureKey = 'auth';

export const authReducer = createReducer(
  initialAuthState,
  on(loginRequested, (state) => ({ ...state, loading: true, error: null })),
on(loginSucceeded, (state, { response }) => {
  const next: AuthState = {
    ...state,
    accessToken: response.token,
    userId: String(response.userID),
    compID: String(response.compID),
    loading: false,
    error: null,
  };

  localStorage.setItem('auth', JSON.stringify(next));

  return next;
}),
  on(loginFailed, (state, { error }) => ({ ...state, loading: false, error })),
  on(logout, () => {
    localStorage.removeItem('auth');
    return { ...initialAuthState };
  })
);

