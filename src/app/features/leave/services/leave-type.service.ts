import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface LeaveTypeDto {
  leaveTypeID: number;
  compID: number;
  leaveName: string;
}

@Injectable({ providedIn: 'root' })
export class LeaveTypeService {
  private apiUrl = 'http://localhost:5236/api/leave';
  // private apiUrl = environment.apiUrl + '/api/leave';
  private compId = 1;

  constructor(private http: HttpClient) {}

  getAll(compId: number): Observable<LeaveTypeDto[]> {
    return this.http.get<LeaveTypeDto[]>(`${this.apiUrl}/types/${compId}`);
  }

  create(data: any): Observable<LeaveTypeDto> {
    const payload = {
      leaveName: data.leaveTypeName,
      compID: 1,
      daysPerYear: 10
    };
    return this.http.post<LeaveTypeDto>(`${this.apiUrl}/types`, payload);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/types/${id}`);
  }
}

