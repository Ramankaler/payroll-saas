import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';

export interface LeaveDto {
  leaveID: number;
  empID: number;
  leaveTypeID: number;
  startDate: string;
  endDate: string;
  isHalfDay: boolean;
  halfDayType: string;
  reason: string;
  status: string;
  approvedBy: number;
  CreatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class LeaveService {
  private apiUrl = `${API_BASE_URL}/api/leave`;

  constructor(private http: HttpClient) {}

  getAll(compId: number): Observable<LeaveDto[]> {
    return this.http.get<LeaveDto[]>(`${this.apiUrl}/requests/${compId}`);
  }
// getAll(compId: number, empId: number) {
//   return this.http.get(`${this.apiUrl}/requests/${compId}/${empId}`);
// }
  // getById(id: number): Observable<LeaveDto> {
  //   return this.http.get<LeaveDto>(`${this.apiUrl}/requests/${id}`);
  // }
getLeaveByEmployee(compId:any,empId:any){
return this.http.get<any>(`${this.apiUrl}/requests/${compId}/employee/${empId}` )
}
  getById(id: number): Observable<LeaveDto> {
  return this.http.get<LeaveDto>(`${this.apiUrl}/requests/by-id/${id}`);
}

  create(data: any): Observable<LeaveDto> {
    return this.http.post<LeaveDto>(`${this.apiUrl}/requests`, data);
  }

  getAnnualBalance(empId: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/annual-balance/${empId}`
    );
  }

  previewAnnualLeave(data: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/annual-preview`,
      data
    );
  }

  update(id: number, data: any): Observable<LeaveDto> {
    return this.http.put<LeaveDto>(`${this.apiUrl}/requests/${id}`, data);
  }

cancel(id: number): Observable<LeaveDto> {
  return this.http.put<LeaveDto>(
    `${this.apiUrl}/requests/cancel/${id}`,
    {}
  );
}
  approve(id: number): Observable<LeaveDto> {
    return this.http.put<LeaveDto>(`${this.apiUrl}/requests/status/${id}`, {});
  }

  reject(id: number): Observable<LeaveDto> {
    return this.http.put<LeaveDto>(`${this.apiUrl}/requests/reject/${id}`, {});
  }


}

