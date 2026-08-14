import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../../core/config/api.config';

@Injectable({ providedIn: 'root' })
export class DesignationService {
private apiUrl = `${API_BASE_URL}/api/designation`;

  constructor(private http: HttpClient) {}

  getAll(compId: number) {
    return this.http.get<any[]>(`${this.apiUrl}/${compId}`);
  }

  getById(id: number) {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  create(data: any) {
    return this.http.post(this.apiUrl, data);
  }

  update(id: number, data: any) {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }


}
