import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';

export interface Shift {
  shiftID: number;
  compID: number;
  shiftName: string;
  startTime: string;
  endTime: string;
  graceMinutes: number;
  standardHours: number;
  isOvernight: boolean;
  isActive: boolean;
  createdAt?: string;
}

export type ShiftRequest = Pick<
  Shift,
  | 'shiftName'
  | 'startTime'
  | 'endTime'
  | 'graceMinutes'
  | 'standardHours'
>;

@Injectable({
  providedIn: 'root'
})
export class ShiftService {
  private readonly apiUrl = `${API_BASE_URL}/api/shift`;

  constructor(private readonly http: HttpClient) {}

  getAll(compId: number): Observable<Shift[]> {
    return this.http.get<Shift[]>(`${this.apiUrl}/${compId}`);
  }

  create(request: ShiftRequest): Observable<Shift> {
    return this.http.post<Shift>(this.apiUrl, request);
  }

  update(id: number, request: ShiftRequest): Observable<Shift> {
    return this.http.put<Shift>(`${this.apiUrl}/${id}`, request);
  }

  updateStatus(id: number, isActive: boolean): Observable<unknown> {
    return this.http.put(`${this.apiUrl}/${id}/status`, {
      isActive
    });
  }
}
