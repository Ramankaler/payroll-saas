import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';

export interface Device {
  deviceID: number;
  compID: number;
  deviceName: string;
  serialNumber: string | null;
  deviceModel: string | null;
  firmwareVersion: string | null;
  machineNo: number;
  connectionMode: string | null;
  ipAddress: string | null;
  port: number | null;
  locationName: string | null;
  isActive: boolean;
  createdAtUtc: string;
}

export type DeviceRequest = Pick<
  Device,
  | 'deviceName'
  | 'serialNumber'
  | 'deviceModel'
  | 'firmwareVersion'
  | 'machineNo'
  | 'connectionMode'
  | 'ipAddress'
  | 'port'
  | 'locationName'
>;

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  private readonly apiUrl = `${API_BASE_URL}/api/device`;

  constructor(private readonly http: HttpClient) {}

  getAll(compId: number): Observable<Device[]> {
    return this.http.get<Device[]>(`${this.apiUrl}/${compId}`);
  }

  create(request: DeviceRequest): Observable<Device> {
    return this.http.post<Device>(this.apiUrl, request);
  }

  update(id: number, request: DeviceRequest): Observable<Device> {
    return this.http.put<Device>(`${this.apiUrl}/${id}`, request);
  }

  updateStatus(id: number, isActive: boolean): Observable<unknown> {
    return this.http.put(`${this.apiUrl}/${id}/status`, {
      isActive
    });
  }

  testConnection(id: number): Observable<unknown> {
    return this.http.post(`${API_BASE_URL}/api/zkteco/test/${id}`, {});
  }

  syncPunches(id: number): Observable<unknown> {
    return this.http.post(`${API_BASE_URL}/api/zkteco/sync/${id}`, {});
  }
}
