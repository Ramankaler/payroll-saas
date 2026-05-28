import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_ROUTES } from '../../../core/config/api.config';
import { Observable } from 'rxjs';

export interface EmployeeDto {
  empID: number;
  employeeId: string;
  empCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  gender?: string | null;
  dob?: string | null;
  deptID?: number | null;
  desigID?: number | null;
  joiningDate: string;
  managerId?: number | null;
  workLocation?: string | null;
  basicSalary: number;
  allowancesAmount: number;
  isActive: boolean;
}

export interface EmployeeCreateRequest {
  employeeId: string;
  empCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  gender?: string | null;
  dob?: string | null;
  deptID?: number | null;
  desigID?: number | null;
  joiningDate: string;
  employmentType?: string | null;
  managerId?: number | null;
  workLocation?: string | null;
  basicSalary: number;
  allowancesAmount: number;
  taxNumber?: string | null;
  paymentMode?: string | null;
  bankDetails?: string | null;
}

@Injectable({ providedIn: 'root' })
export class EmployeesApi {
  constructor(private readonly http: HttpClient) {}

  list(): Observable<EmployeeDto[]> {
    return this.http.get<EmployeeDto[]>(API_ROUTES.employees);
  }

  create(req: EmployeeCreateRequest): Observable<EmployeeDto> {
    return this.http.post<EmployeeDto>(API_ROUTES.employees, req);
  }
}
