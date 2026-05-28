import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Company, CompanyService } from '../../services/company.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [
    FormsModule,
CommonModule
  ],
  templateUrl: './company-list.component.html',
  styleUrl: './company-list.component.scss'
})
export class CompanyListComponent {

  companies: any[] = [];

  constructor(
    private companyService: CompanyService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.companyService.getAll().subscribe(res => {
      this.companies = res;
      console.log('companies',this.companies);
    });
  }

  delete(id: number) {
    if (!confirm('Delete this company?')) return;

    this.companyService.delete(id).subscribe(() => {
      this.load();
    });
  }

  edit(id: number) {
    this.router.navigate(['/company/edit', id]);
  }

}
