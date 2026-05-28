import { createFeatureSelector, createSelector } from '@ngrx/store';
import { authFeatureKey } from './auth.reducer';
import type { AuthState } from './auth.state';

export const selectAuthState = createFeatureSelector<AuthState>(authFeatureKey);

export const selectAccessToken = createSelector(selectAuthState, (s) => s.accessToken);

export const selectPermissions = createSelector(selectAuthState, (s) => s.permissions);

export const selectIsAuthenticated = createSelector(selectAccessToken, (token) => !!token);

