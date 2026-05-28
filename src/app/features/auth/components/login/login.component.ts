import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatError } from '@angular/material/form-field';

import { loginRequested } from '../../store/auth.actions';
import { selectAccessToken, selectAuthState } from '../../store/auth.selectors';
import { filter, take } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatError,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {

  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly authState$ = this.store.select(selectAuthState);

readonly form = this.fb.group({
  compID: [1, Validators.required],
  email: ['', [Validators.required, Validators.email]],
  PasswordHash: ['', [Validators.required, Validators.minLength(6)]],
});


  ngOnInit() {
    this.store.select(selectAccessToken)
      .pipe(
        filter(t => !!t),
        take(1)
      )
      .subscribe(() => this.router.navigate(['dashboard']));
  }

  onSubmit() {

    if (this.form.invalid) return;

    this.store.dispatch(
      loginRequested({
        request: {
          compID: String(this.form.value.compID),
          email: this.form.value.email!,
          PasswordHash: this.form.value.PasswordHash!,
        }
      })
    );

  }

}
