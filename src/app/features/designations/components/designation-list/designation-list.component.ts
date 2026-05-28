import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { DesignationService } from '../../services/designation.service';
import { DesignationDialogComponent } from '../designation-dialog/designation-dialog.component';

interface DesignationDto {
  desigID: number;
  desigName: string;
}

@Component({
  selector: 'app-designation-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    FormsModule
  ],
  templateUrl: './designation-list.component.html',
  styleUrls: ['./designation-list.component.scss']
})
export class DesignationListComponent implements OnInit {
  designations: DesignationDto[] = [];
  filteredDesignations: DesignationDto[] = [];
  displayedColumns: string[] = ['desigName', 'actions'];
  searchTerm = '';

  constructor(
    private desigSrv: DesignationService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.fetch();
  }

  fetch(): void {
    this.desigSrv.getAll(1).subscribe({
      next: (res: any[]) => {
        this.designations = res || [];
        this.filteredDesignations = [...this.designations];
      },
      error: (e) => console.error('Designation load error:', e)
    });
  }

  addDesignation() {
    const dialogRef = this.dialog.open(DesignationDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetch();
        this.snackBar.open('Designation added', 'Close', { duration: 3000 });
      }
    });
  }

  applyFilter(event: any) {
    const term = event.target.value.toLowerCase();
    this.filteredDesignations = this.designations.filter(desig =>
      desig.desigName.toLowerCase().includes(term)
    );
  }

  editDesignation(desig: DesignationDto) {
    const dialogRef = this.dialog.open(DesignationDialogComponent, {
      width: '400px',
      data: { isEdit: true, desig }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetch();
        this.snackBar.open('Designation updated', 'Close', { duration: 3000 });
      }
    });
  }

  deleteDesignation(desig: any) {

  const confirmDelete = confirm(`Delete "${desig.desigName}" designation?`);

  if (!confirmDelete) return;

  this.desigSrv.delete(desig.desigID).subscribe({

    next: () => {
      this.fetch();
      this.snackBar.open('Designation deleted', 'Close', { duration: 3000 });
    },

    error: (err) => {

      if (err.status === 400) {
        this.snackBar.open(err.error || 'Cannot delete designation', 'Close', {
          duration: 4000
        });
      } else {
        this.snackBar.open('Delete failed', 'Close', { duration: 3000 });
      }

      console.error(err);
    }

  });
}
}

