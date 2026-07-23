import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthSessionService } from '../../../../core/services/auth-session.service';
import {
  Device,
  DeviceRequest,
  DeviceService
} from '../../services/device.service';

@Component({
  selector: 'app-device-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './device-list.component.html'
})
export class DeviceListComponent {
  private readonly authSession = inject(AuthSessionService);
  private readonly deviceService = inject(DeviceService);

  devices: Device[] = [];
  isSaving = false;
  message = '';
  editingId: number | null = null;

  form = {
    deviceName: '',
    serialNumber: '',
    deviceModel: '',
    firmwareVersion: '',
    machineNo: 1,
    connectionMode: '',
    ipAddress: '',
    port: null as number | null,
    locationName: ''
  };

  ngOnInit(): void {
    this.loadDevices();
  }

  loadDevices(): void {
    this.deviceService
      .getAll(this.authSession.companyId)
      .subscribe({
        next: devices => {
          this.devices = devices;
        }
      });
  }

  save(): void {
    if (!this.form.deviceName.trim()) {
      this.message = 'Device name is required.';
      return;
    }

    this.isSaving = true;
    this.message = '';

    const request: DeviceRequest = {
      deviceName: this.form.deviceName.trim(),
      serialNumber: this.clean(this.form.serialNumber),
      deviceModel: this.clean(this.form.deviceModel),
      firmwareVersion: this.clean(this.form.firmwareVersion),
      machineNo: Number(this.form.machineNo || 1),
      connectionMode: this.clean(this.form.connectionMode),
      ipAddress: this.clean(this.form.ipAddress),
      port: this.form.port ? Number(this.form.port) : null,
      locationName: this.clean(this.form.locationName)
    };

    const action =
      this.editingId === null
        ? this.deviceService.create(request)
        : this.deviceService.update(this.editingId, request);

    action.subscribe({
      next: () => {
        this.isSaving = false;
        this.message = 'Device saved.';
        this.reset();
        this.loadDevices();
      },
      error: err => {
        this.isSaving = false;
        this.message =
          err?.error?.message || 'Failed to save device.';
      }
    });
  }

  edit(device: Device): void {
    this.editingId = device.deviceID;
    this.form = {
      deviceName: device.deviceName,
      serialNumber: device.serialNumber || '',
      deviceModel: device.deviceModel || '',
      firmwareVersion: device.firmwareVersion || '',
      machineNo: device.machineNo || 1,
      connectionMode: device.connectionMode || '',
      ipAddress: device.ipAddress || '',
      port: device.port,
      locationName: device.locationName || ''
    };
  }

  toggleStatus(device: Device): void {
    this.deviceService
      .updateStatus(device.deviceID, !device.isActive)
      .subscribe({
        next: () => this.loadDevices()
      });
  }

  testConnection(device: Device): void {
    this.message = 'Testing device connection...';

    this.deviceService
      .testConnection(device.deviceID)
      .subscribe({
        next: () => {
          this.message = 'Device connection successful.';
        },
        error: err => {
          this.message =
            err?.error?.message || 'Device connection failed.';
        }
      });
  }

  syncPunches(device: Device): void {
    this.message = 'Syncing punches...';

    this.deviceService
      .syncPunches(device.deviceID)
      .subscribe({
        next: (result: unknown) => {
          this.message =
            'Punch sync completed. Check attendance logs.';
          console.log(result);
        },
        error: err => {
          this.message =
            err?.error?.message || 'Punch sync failed.';
        }
      });
  }

  reset(): void {
    this.editingId = null;
    this.form = {
      deviceName: '',
      serialNumber: '',
      deviceModel: '',
      firmwareVersion: '',
      machineNo: 1,
      connectionMode: '',
      ipAddress: '',
      port: null,
      locationName: ''
    };
  }

  private clean(value: string): string | null {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }
}
