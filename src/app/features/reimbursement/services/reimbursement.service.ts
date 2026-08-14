import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';

export interface ReimbursementDto {
  reimbID: number;
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
  private apiUrl = `${API_BASE_URL}/api/reimbursement`;

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

 cancel(id: number): Observable<ReimbursementDto> {
  return this.http.put<ReimbursementDto>(
    `${this.apiUrl}/${id}/cancel`,
    {}
  );
}

approve(
  id: number,
  status: 'approved' | 'rejected'
): Observable<ReimbursementDto> {
  return this.http.put<ReimbursementDto>(
    `${this.apiUrl}/${id}/status`,
    { status }
  );
}
}
export interface ReimbursementDto {
  reimbID: number;
  empID: number;
  amount: number;
  expenseType: string;
  description: string;
  billFile: string;
  status: string;
  approvedBy: number;
  CreatedAt: string;
}

