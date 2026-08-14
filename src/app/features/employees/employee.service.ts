import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/config/api.config';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private apiUrl = `${API_BASE_URL}/api/employee`;

  constructor(private http: HttpClient) {}

  getAll(compId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${compId}`);
  }

  getPage(
    compId: number,
    page: number,
    pageSize: number,
    search: string
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    if (search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<any>(
      `${this.apiUrl}/${compId}/page`,
      { params }
    );
  }

  create(payload: any): Observable<any> {
    return this.http.post(this.apiUrl, payload);
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/detail/${id}`);
  }

  getDepartments(compId: number): Observable<any[]> {
    return this.http.get<any[]>(`${API_BASE_URL}/api/department/${compId}`);
  }

  getDesignations(compId: number): Observable<any[]> {
    return this.http.get<any[]>(`${API_BASE_URL}/api/designation/${compId}`);
  }

  getDocuments(empId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/documents/${empId}`);
  }

 uploadDocument(formData: FormData): Observable<any> {
  return this.http.post(`${this.apiUrl}/upload-document`, formData);
}

  update(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

updateStatus(id: number, isActive: boolean): Observable<any> {
  return this.http.put(
    `${this.apiUrl}/${id}/status`,
    { isActive }
  );
}
}
