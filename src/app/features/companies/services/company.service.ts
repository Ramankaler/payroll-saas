import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Company {
  compID: number;
  CompanyName: string;
  industry: string;
  country: string;
  currency: string;
  timezone: string;
  payrollCycle: string;
}

@Injectable({ providedIn: 'root' })
export class CompanyService {

  private apiUrl = 'http://localhost:5236/api/company';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Company[]> {
    return this.http.get<Company[]>(this.apiUrl);
  }

  create(data: any): Observable<Company> {
    return this.http.post<Company>(this.apiUrl, data);
  }

  update(id: number, data: any): Observable<Company> {
    return this.http.put<Company>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
