import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';

interface AttendanceLog {
  id: string;
  employeeName: string;
  punchIn: string;
  punchOut: string;
  shift: string;
  status: 'Present' | 'Late' | 'Absent';
  date: string;
}

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressBarModule, MatTableModule],
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss'],
})
export class AttendanceComponent {
  displayedColumns: string[] = ['employeeName', 'punchIn', 'punchOut', 'shift', 'status'];
  attendanceLogs: AttendanceLog[] = [
    { id: '1', employeeName: 'John Doe', punchIn: '09:02', punchOut: '18:15', shift: '9-6', status: 'Late', date: '2024-05-20' },
    { id: '2', employeeName: 'Sarah Wilson', punchIn: '08:55', punchOut: '17:45', shift: '9-6', status: 'Present', date: '2024-05-20' },
    { id: '3', employeeName: 'Mike Johnson', punchIn: '09:30', punchOut: '17:30', shift: '9-6', status: 'Late', date: '2024-05-20' },
    { id: '4', employeeName: 'Emma Davis', punchIn: '', punchOut: '', shift: '9-6', status: 'Absent', date: '2024-05-20' },
    { id: '5', employeeName: 'David Brown', punchIn: '09:00', punchOut: '18:00', shift: '9-6', status: 'Present', date: '2024-05-20' },
  ];
  uploading = false;
  uploadProgress = 0;
  importResult: { success: boolean; message: string } | null = null;
  file: File | null = null;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.file = input.files?.[0] || null;
  }

  importCsv(): void {
    if (!this.file) return;
    this.uploading = true;
    this.uploadProgress = 0;
    const interval = setInterval(() => {
      this.uploadProgress = Math.min(this.uploadProgress + 10, 100);
      if (this.uploadProgress >= 100) {
        clearInterval(interval);
        this.uploading = false;
        this.importResult = { success: true, message: 'Import completed' };
      }
    }, 200);
  }
}
