export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  roles: string[];
  permissions: string[];
  accessTokenExpiresAtUtc: string | null;
  compID: string | null;
  userId: string | null;
  loading: boolean;
  error: string | null;
}

export const initialAuthState: AuthState = (() => {
  try {
    const raw = localStorage.getItem('auth');
    if (!raw) {
      return {
        accessToken: null,
        refreshToken: null,
        roles: [],
        permissions: [],
        accessTokenExpiresAtUtc: null,
        compID: null,
        userId: null,
        loading: false,
        error: null,
      };
    }
    const parsed = JSON.parse(raw) as Partial<AuthState>;
    return {
      accessToken: parsed.accessToken ?? null,
      refreshToken: parsed.refreshToken ?? null,
      roles: parsed.roles ?? [],
      permissions: parsed.permissions ?? [],
      accessTokenExpiresAtUtc: parsed.accessTokenExpiresAtUtc ?? null,
      compID: parsed.compID ?? null,
      userId: parsed.userId ?? null,
      loading: false,
      error: null,
    };
  } catch {
    return {
      accessToken: null,
      refreshToken: null,
      roles: [],
      permissions: [],
      accessTokenExpiresAtUtc: null,
      compID: null,
      userId: null,
      loading: false,
      error: null,
    };
  }
})();

