import { Injectable } from '@angular/core';

interface StoredAuthentication {
  compID?: number | null;
  userID?: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class AuthSessionService {
  get companyId(): number {
    const authentication = this.readAuthentication();

    if (
      typeof authentication.compID !== 'number' ||
      authentication.compID <= 0
    ) {
      throw new Error(
        'Authenticated company ID is unavailable.'
      );
    }

    return authentication.compID;
  }

  get userId(): number {
    const authentication = this.readAuthentication();

    if (
      typeof authentication.userID !== 'number' ||
      authentication.userID <= 0
    ) {
      throw new Error(
        'Authenticated user ID is unavailable.'
      );
    }

    return authentication.userID;
  }

  private readAuthentication(): StoredAuthentication {
    const raw = localStorage.getItem('auth');

    if (!raw) {
      return {};
    }

    try {
      return JSON.parse(raw) as StoredAuthentication;
    } catch {
      return {};
    }
  }
}
