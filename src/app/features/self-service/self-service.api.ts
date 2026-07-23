import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/config/api.config';

export interface LeaveType {
  leaveTypeID: number;
  leaveName: string;
  daysPerYear: number;
}

@Injectable({ providedIn: 'root' })
export class SelfServiceApi {
  private readonly baseUrl = `${API_BASE_URL}/api/self`;
  private readonly approvalUrl = `${API_BASE_URL}/api/approvals`;

  constructor(private readonly http: HttpClient) {}

  dashboard(): Observable<any> {
    return this.http.get(`${this.baseUrl}/dashboard`);
  }

  attendance(from: string, to: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/attendance`, {
      params: { from, to },
    });
  }

  attendancePunches(from: string, to: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/attendance-punches`, {
      params: { from, to },
    });
  }

  leaveTypes(): Observable<LeaveType[]> {
    return this.http.get<LeaveType[]>(`${this.baseUrl}/leave-types`);
  }

  leaveBalances(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/leave-balances`);
  }

  leaves(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/leaves`);
  }

  createLeave(request: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/leaves`, request);
  }

  cancelLeave(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/leaves/${id}/cancel`, {});
  }

  reimbursements(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/reimbursements`);
  }

  createReimbursement(request: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/reimbursements`, request);
  }

  payslips(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/payslips`);
  }

  downloadPayslip(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/payslips/${id}/download`, {
      responseType: 'blob',
    });
  }

  approvals(): Observable<any> {
    return this.http.get(this.approvalUrl);
  }

  reviewLeave(
    id: number,
    action: 'approve' | 'reject',
    comments: string
  ): Observable<any> {
    return this.http.put(`${this.approvalUrl}/leaves/${id}`, {
      action,
      comments,
    });
  }

  reviewReimbursement(
    id: number,
    action: 'approve' | 'reject',
    comments: string
  ): Observable<any> {
    return this.http.put(`${this.approvalUrl}/reimbursements/${id}`, {
      action,
      comments,
    });
  }
}
