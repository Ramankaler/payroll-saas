import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DesignationService {
private apiUrl = 'http://localhost:5236/api/designation';
// private apiUrl = environment.apiUrl + '/api/designation';

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

  delete(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}

