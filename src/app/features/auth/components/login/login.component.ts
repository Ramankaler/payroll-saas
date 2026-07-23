import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, take } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { loginRequested } from '../../store/auth.actions';
import {
  selectAuthState,
} from '../../store/auth.selectors';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly authState$ = this.store.select(selectAuthState);

credentials: {
  compID: number | null;
  username: string;
  password: string;
} = {
  compID: null,
  username: '',
  password: '',
};

  ngOnInit(): void {
    this.store
      .select(selectAuthState)
      .pipe(
        filter((state) => Boolean(state.accessToken)),
        take(1)
      )
      .subscribe((state) => {
        this.router.navigate([
          state.mustChangePassword
            ? 'change-password'
            : 'dashboard',
        ]);
      });
  }

onSubmit(form: NgForm): void {
  if (form.invalid || this.credentials.compID === null) {
    form.control.markAllAsTouched();
    return;
  }

  this.store.dispatch(
    loginRequested({
      request: {
        compID: this.credentials.compID,
        username: this.credentials.username.trim(),
        password: this.credentials.password,
      },
    })
  );
}
}
