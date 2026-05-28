import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CompanyService } from '../../services/company.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-company-create',
  standalone: true,
  imports: [
    FormsModule,

  ],
  templateUrl: './company-create.component.html',
  styleUrl: './company-create.component.scss'
})
export class CompanyCreateComponent {
  company: any = {
    CompanyName: '',
    industry: '',
    country: '',
    currency: '',
    timezone: '',
    payrollCycle: ''
  };

  constructor(
    private companyService: CompanyService,
    private router: Router
  ) {}

  save() {

    if (!this.company.CompanyName) {
      alert('Company name required');
      return;
    }

    this.companyService.create(this.company).subscribe(() => {
      this.router.navigate(['/company']);
    });
  }
}
