import { Component } from '@angular/core';
import { Branch, BranchService } from '../../services/branch.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-branch-list',
  standalone: true,
  imports: [CommonModule,FormsModule,RouterModule],
  templateUrl: './branch-list.component.html',
  styleUrl: './branch-list.component.scss'
})
export class BranchListComponent {

  branches: Branch[] = [];
  compId = 1; // later dynamic

  constructor(private branchService: BranchService) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.branchService.getAll(this.compId).subscribe(res => {
      this.branches = res;
    });
  }

  delete(id: number) {
    if (!confirm('Delete this branch?')) return;

    this.branchService.delete(id).subscribe(() => {
      this.load();
    });
  }
}
