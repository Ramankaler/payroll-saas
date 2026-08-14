import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';

export interface Branch {
  branchID: number;
  branchName: string;
  compID: number;
  location?: string;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class BranchService {

  private apiUrl = `${API_BASE_URL}/api/branch`;

  constructor(private http: HttpClient) {}

  getAll(compId: number): Observable<Branch[]> {
    return this.http.get<Branch[]>(`${this.apiUrl}/${compId}`);
  }

  create(data: any): Observable<Branch> {
    return this.http.post<Branch>(this.apiUrl, data);
  }

  update(id: number, data: any): Observable<Branch> {
    return this.http.put<Branch>(`${this.apiUrl}/${id}`, data);
  }

updateStatus(id: number, isActive: boolean): Observable<any> {
  return this.http.put(
    `${this.apiUrl}/${id}/status`,
    { isActive }
  );
}
}
