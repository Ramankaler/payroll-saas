import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppLoadingComponent } from './core/components/app-loading.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AppLoadingComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'angular-payroll-app';
}
