import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';

@Injectable({ providedIn: 'root' })
export class AssetService {
  private apiUrl = `${API_BASE_URL}/api/assets`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getPage(page: number, pageSize: number, search: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    if (search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<any>(`${this.apiUrl}/page`, { params });
  }

  searchAvailable(search: string, limit = 20): Observable<any[]> {
    let params = new HttpParams().set('limit', limit);

    if (search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<any[]>(`${this.apiUrl}/available`, { params });
  }

  searchEmployees(search: string, limit = 20): Observable<any[]> {
    let params = new HttpParams().set('limit', limit);

    if (search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<any[]>(
      `${API_BASE_URL}/api/employee/lookup`,
      { params }
    );
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  create(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  update(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  updateStatus(id: number, isActive: boolean): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/status`, { isActive });
  }

  getAllocations(
    page: number,
    pageSize: number,
    search: string,
    status: string
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    if (search.trim()) {
      params = params.set('search', search.trim());
    }

    if (status && status !== 'All') {
      params = params.set('status', status);
    }

    return this.http.get<any>(`${this.apiUrl}/allocations`, { params });
  }

  allocate(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/allocate`, data);
  }

  returnAsset(allocID: number, data: any): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/allocations/${allocID}/return`,
      data
    );
  }
}
