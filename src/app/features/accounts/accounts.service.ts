import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/config/api.config';

@Injectable({ providedIn: 'root' })
export class AccountsService {
  private apiUrl = `${API_BASE_URL}/api/accounts`;

  constructor(private http: HttpClient) {}

  getSettings(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/settings`);
  }

  saveSettings(data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/settings`, data);
  }

  getChart(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/chart`);
  }

  seedChart(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/chart/seed`, {});
  }

  createAccount(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/chart`, data);
  }

  updateAccount(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/chart/${id}`, data);
  }

  updateAccountStatus(id: number, isActive: boolean): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/chart/${id}/status`, {
      isActive,
    });
  }

  getJournals(filters: any): Observable<any[]> {
    let params = new HttpParams()
      .set('limit', filters.limit || 5000);

    if (filters.from) {
      params = params.set('from', filters.from);
    }

    if (filters.to) {
      params = params.set('to', filters.to);
    }

    if (filters.status) {
      params = params.set('status', filters.status);
    }

    return this.http.get<any[]>(`${this.apiUrl}/journals`, { params });
  }

  createJournal(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/journals`, data);
  }

  postJournal(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/journals/${id}/post`, {});
  }

  reverseJournal(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/journals/${id}/reverse`, {});
  }

  postPayroll(payrollId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/post-payroll/${payrollId}`, {});
  }

  getReport(report: string, filters: any): Observable<any[]> {
    let params = new HttpParams();

    if (filters.from) {
      params = params.set('from', filters.from);
    }

    if (filters.to) {
      params = params.set('to', filters.to);
    }

    return this.http.get<any[]>(
      `${this.apiUrl}/reports/${report}`,
      { params }
    );
  }
}
