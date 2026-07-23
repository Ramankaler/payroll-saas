import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';

@Injectable({ providedIn: 'root' })
export class AssetService {
  private apiUrl = `${API_BASE_URL}/api/assets`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
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

  getAllocations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/allocations`);
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
