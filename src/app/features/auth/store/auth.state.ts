export interface AuthState {
  accessToken: string | null;
  tokenType: string | null;
  expiresAtUtc: string | null;
  roles: string[];
  permissions: string[];
  compID: number | null;
  userID: number | null;
  employeeID: number | null;
  username: string | null;
  mustChangePassword: boolean;
  loading: boolean;
  error: string | null;
}

const emptyAuthState = (): AuthState => ({
  accessToken: null,
  tokenType: null,
  expiresAtUtc: null,
  roles: [],
  permissions: [],
  compID: null,
  userID: null,
  employeeID: null,
  username: null,
  mustChangePassword: false,
  loading: false,
  error: null,
});

export const initialAuthState: AuthState = (() => {
  try {
    const raw = localStorage.getItem('auth');

    if (!raw) {
      return emptyAuthState();
    }

    const parsed = JSON.parse(raw) as Partial<AuthState>;

    return {
      accessToken: parsed.accessToken ?? null,
      tokenType: parsed.tokenType ?? null,
      expiresAtUtc: parsed.expiresAtUtc ?? null,
      roles: parsed.roles ?? [],
      permissions: parsed.permissions ?? [],
      compID:
        typeof parsed.compID === 'number'
          ? parsed.compID
          : null,
      userID:
        typeof parsed.userID === 'number'
          ? parsed.userID
          : null,
      employeeID:
        typeof parsed.employeeID === 'number'
          ? parsed.employeeID
          : null,
      username: parsed.username ?? null,
      mustChangePassword:
        parsed.mustChangePassword === true,
      loading: false,
      error: null,
    };
  } catch {
    return emptyAuthState();
  }
})();
