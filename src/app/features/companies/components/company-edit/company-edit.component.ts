import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyService } from '../../services/company.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-company-edit',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './company-edit.component.html',
  styleUrl: './company-edit.component.scss'
})
export class CompanyEditComponent {

    company: any = {};

  constructor(
    private companyService: CompanyService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];

    this.companyService.getAll().subscribe(res => {
      this.company = res.find(x => x.compID == id);
    });
  }

  save() {
    this.companyService.update(this.company.compID, this.company).subscribe(() => {
      this.router.navigate(['/company']);
    });
  }

}
