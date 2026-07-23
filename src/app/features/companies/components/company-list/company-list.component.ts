import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {
  Company,
  CompanyService
} from '../../services/company.service';

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './company-list.component.html',
  styleUrl: './company-list.component.scss'
})
export class CompanyListComponent {
  company: Company | null = null;

  constructor(
    private companyService: CompanyService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.companyService.getCurrent().subscribe({
      next: company => {
        this.company = company;
      }
    });
  }

  edit(id: number): void {
    this.router.navigate(['/company/edit', id]);
  }
}
