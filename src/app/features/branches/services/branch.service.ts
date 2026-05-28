import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Branch {
  branchID: number;
  branchName: string;
  compID: number;
  location?: string;
}

@Injectable({ providedIn: 'root' })
export class BranchService {

  private apiUrl = 'http://localhost:5236/api/branch';

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

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
