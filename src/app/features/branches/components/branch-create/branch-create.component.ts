import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BranchService } from '../../services/branch.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-branch-create',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './branch-create.component.html',
  styleUrl: './branch-create.component.scss'
})
export class BranchCreateComponent {
  branch: any = {
    branchName: '',
    location: '',
    compID: 1
  };

  constructor(
    private branchService: BranchService,
    private router: Router
  ) {}

  save() {
    if (!this.branch.branchName) {
      alert('Branch name required');
      return;
    }

    this.branchService.create(this.branch).subscribe(() => {
      this.router.navigate(['/branch']);
    });
  }
}
