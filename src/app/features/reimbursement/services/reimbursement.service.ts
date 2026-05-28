import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReimbursementDto {
  reimID: number;
  empID: number;
  amount: number;
  expenseType: string;
  description: string;
  billFile: string;
  status: string;
  approvedBy: number;
  CreatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class ReimbursementService {
  private apiUrl = 'http://localhost:5236/api/reimbursement';

  constructor(private http: HttpClient) {}

  getAll(compId: number): Observable<ReimbursementDto[]> {
    return this.http.get<ReimbursementDto[]>(`${this.apiUrl}/${compId}`);
  }

  getById(id: number): Observable<ReimbursementDto> {
    return this.http.get<ReimbursementDto>(`${this.apiUrl}/${id}`);
  }

  create(data: any): Observable<ReimbursementDto> {
    return this.http.post<ReimbursementDto>(this.apiUrl, data);
  }

  update(id: number, data: any): Observable<ReimbursementDto> {
    return this.http.put<ReimbursementDto>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  approve(id: number, status: string): Observable<ReimbursementDto> {
    return this.http.put<ReimbursementDto>(`${this.apiUrl}/${id}/status`, status);
  }
}

