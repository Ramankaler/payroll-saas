import { Component, inject } from '@angular/core';
import { Branch, BranchService } from '../../services/branch.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthSessionService } from '../../../../core/services/auth-session.service';

@Component({
  selector: 'app-branch-list',
  standalone: true,
  imports: [CommonModule,FormsModule,RouterModule],
  templateUrl: './branch-list.component.html',
  styleUrl: './branch-list.component.scss'
})
export class BranchListComponent {

  branches: Branch[] = [];
  private readonly authSession =  inject(AuthSessionService);

  get compId(): number {
  return this.authSession.companyId;
}
  constructor(private branchService: BranchService) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.branchService.getAll(this.compId).subscribe(res => {
      this.branches = res;
    });
  }

toggleStatus(branch: Branch): void {
  const newStatus = !branch.isActive;

  this.branchService
    .updateStatus(branch.branchID, newStatus)
    .subscribe({
      next: () => {
        branch.isActive = newStatus;
      },
      error: () => {
        alert('Failed to update branch status.');
      },
    });
}
}
