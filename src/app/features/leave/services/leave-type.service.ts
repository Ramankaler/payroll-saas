import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthSessionService } from '../../../core/services/auth-session.service';

export interface LeaveTypeDto {
  leaveTypeID: number;
  compID: number;
  leaveName: string;
  daysPerYear: number;
}

@Injectable({
  providedIn: 'root',
})
export class LeaveTypeService {
  private readonly apiUrl =
    'http://localhost:5236/api/leave';

  constructor(
    private readonly http: HttpClient,
    private readonly authSession: AuthSessionService
  ) {}

  getAll(
    _ignoredCompanyId?: number
  ): Observable<LeaveTypeDto[]> {
    return this.http.get<LeaveTypeDto[]>(
      `${this.apiUrl}/types/${this.authSession.companyId}`
    );
  }

  create(data: any): Observable<LeaveTypeDto> {
    const payload = {
      leaveName: data.leaveTypeName,
      compID: this.authSession.companyId,
      daysPerYear: data.daysPerYear ?? 10,
    };

    return this.http.post<LeaveTypeDto>(
      `${this.apiUrl}/types`,
      payload
    );
  }

}
