import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/config/api.config';

@Injectable({ providedIn: 'root' })
export class GatePassService {
  private apiUrl = `${API_BASE_URL}/api/gatepass`;

  constructor(private http: HttpClient) {}

  getAll(compId: number, filters: any): Observable<any[]> {
    let params = new HttpParams()
      .set('limit', filters.limit || 5000);

    if (filters.empID) {
      params = params.set('empId', filters.empID);
    }

    if (filters.status) {
      params = params.set('status', filters.status);
    }

    if (filters.from) {
      params = params.set('from', filters.from);
    }

    if (filters.to) {
      params = params.set('to', filters.to);
    }

    return this.http.get<any[]>(`${this.apiUrl}/${compId}`, { params });
  }

  create(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  update(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  approve(id: number, remarks: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/status`, {
      action: 'approve',
      remarks,
    });
  }

  reject(id: number, remarks: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/status`, {
      action: 'reject',
      remarks,
    });
  }

  cancel(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/cancel`, {});
  }

  markOut(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/out`, {
      timeUtc: new Date().toISOString(),
    });
  }

  markIn(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/in`, {
      timeUtc: new Date().toISOString(),
    });
  }
}
