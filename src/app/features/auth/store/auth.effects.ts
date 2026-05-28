import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { AuthApi } from '../data/auth.api';
import { loginFailed, loginRequested, loginSucceeded } from './auth.actions';

@Injectable()
export class AuthEffects {
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loginRequested),
      switchMap((action) =>
        this.api.login(action.request).pipe(
          map((response) => loginSucceeded({ response })),
          catchError((err) =>
            of(loginFailed({ error: err?.error?.detail ?? 'Login failed' }))
          )
        )
      )
    )
  );

  constructor(private readonly actions$: Actions, private readonly api: AuthApi) {}
}

