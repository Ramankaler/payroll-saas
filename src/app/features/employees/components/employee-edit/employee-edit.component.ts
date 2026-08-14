import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { EmployeeService } from '../../employee.service';
import { AuthSessionService } from '../../../../core/services/auth-session.service';
import { Shift, ShiftService } from '../../../shifts/services/shift.service';
import { BranchService } from '../../../branches/services/branch.service';
import { API_BASE_URL } from '../../../../core/config/api.config';


@Component({
  selector: 'app-employee-edit',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    MatListModule,
  ],
  templateUrl: './employee-edit.component.html',
  styleUrls: ['./employee-edit.component.scss'],
})
export class EmployeeEditComponent implements OnInit, OnDestroy {
  private readonly authSession =  inject(AuthSessionService);
  private readonly svc     = inject(EmployeeService);
  private readonly fb      = inject(FormBuilder);
  private readonly router  = inject(Router);
  private readonly route   = inject(ActivatedRoute);
  private readonly snack   = inject(MatSnackBar);
  private readonly shiftService = inject(ShiftService);
  private readonly branchService = inject(BranchService);
  private readonly destroy$ = new Subject<void>();

  employee: any = null;
  departments:  any[]  = [];
  designations: any[] = [];
  shifts: Shift[] = [];
  branches: any[] = [];
  employees: any[] = [];
  documents:    any[] = [];
  loadingPage = true;
  submitting  = false;
  empId!: number;
  managerSearch = '';
  addressMessage = '';

  readonly countries = [
    'United Arab Emirates',
    'India',
    'Saudi Arabia',
    'Qatar',
    'Oman',
    'Bahrain',
    'Kuwait',
    'Pakistan',
    'Nepal',
    'Sri Lanka',
    'Bangladesh',
    'Philippines',
    'United Kingdom',
    'United States'
  ];

  readonly postalCityMap: any = {
    India: {
      '110001': 'New Delhi',
      '160017': 'Chandigarh',
      '400001': 'Mumbai',
      '560001': 'Bengaluru',
      '700001': 'Kolkata'
    }
  };

  // ── Document upload state ─────────────────────────────────────────────────
  selectedFile:    File | null = null;
  uploadingDoc = false;

  // Profile photo
  selectedPhoto: File | null = null;
  previewUrl: string | null = null;

  // ── Form ──────────────────────────────────────────────────────────────────
  form = this.fb.group({
  // Required
  empCode:   ['', [Validators.required, Validators.maxLength(20)]],
  bioID: [''],
  firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName:  ['', [Validators.required, Validators.maxLength(100)]],
    deptID:    [null as number | null, Validators.required],
    desigID:   [null as number | null, Validators.required],
    // Optional
    email:            ['', [Validators.email, Validators.maxLength(200)]],
    phone:            ['', Validators.maxLength(20)],
    gender:           [''],
    dob:              [''],
    joiningDate:      [''],
    managerID:        [null as number | null],
    branchID:         [null as number | null],
    employmentType:   ['full_time'],
    taxNumber:        [''],
    workLocation:     [''],
    shiftID:          [null as number | null],
    city:             [''],
    country:          [''],
    postalCode:       [''],
    basicSalary:      [null as number | null, Validators.min(0)],
    allowancesAmount: [null as number | null, Validators.min(0)],
    bankName:         [''],
    bankAccount:      [''],
    isActive:         [true],
    employmentStatus: ['active'],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.empId = idParam ? Number(idParam) : 0;

    if (!this.empId || isNaN(this.empId)) {
      this.snack.open('Invalid employee ID.', 'Dismiss', { duration: 4000 });
      this.router.navigate(['/employees']);
      return;
    }

    forkJoin({
      employee:     this.svc.getById(this.empId),
      departments:  this.svc.getDepartments(this.authSession.companyId),
      designations: this.svc.getDesignations(this.authSession.companyId),
      shifts:       this.shiftService.getAll(this.authSession.companyId),
      branches:     this.branchService.getAll(this.authSession.companyId),
      employees:    this.svc.getAll(this.authSession.companyId),
      documents:    this.svc.getDocuments(this.empId),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ employee, departments, designations, shifts, branches, employees, documents }) => {
          this.employee     = employee;
          this.departments  = departments  ?? [];
          this.designations = designations ?? [];
          this.shifts       = (shifts ?? []).filter(shift => shift.isActive);
          this.branches     = branches ?? [];
          this.employees    = (employees ?? []).filter(emp => emp.empID !== this.empId);
          this.documents    = documents    ?? [];
          this.patchForm(employee);
          this.setManagerSearch(employee.managerID);
          this.loadingPage = false;

          // Profile photo preview
          if (this.employee?.profilePhoto) {
            this.previewUrl = this.profilePhotoUrl(this.employee.profilePhoto);
          }
        },
        error: (err: any) => {
          this.loadingPage = false;
          const status = err?.status;
          if (status === 404) {
            this.snack.open('Employee not found.', 'Dismiss', { duration: 4000 });
            this.router.navigate(['/employees']);
          } else {
            this.snack.open('Failed to load employee data.', 'Dismiss', { duration: 4000 });
          }
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onPhotoChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedPhoto = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // ── Patch form with existing data ─────────────────────────────────────────
  private patchForm(e: any): void {
    this.form.patchValue({
    empCode:          e.empCode ?? '',
    bioID:      e.bioID ?? '',
    firstName:        e.firstName ?? '',
      lastName:         e.lastName ?? '',
      deptID:           e.deptID ?? null,
      desigID:          e.desigID ?? null,
      email:            e.email ?? '',
      phone:            e.phone ?? '',
      gender:           e.gender ?? '',
      dob:              e.dob ? e.dob.split('T')[0] : '',
      joiningDate:      e.joiningDate ? e.joiningDate.split('T')[0] : '',
      managerID:        e.managerID ?? null,
      branchID:         e.branchID ?? null,
      employmentType:   e.employmentType ?? 'full_time',
      taxNumber:        e.taxNumber ?? '',
      workLocation:     e.workLocation ?? '',
      shiftID:          e.shiftID ?? null,
      city:             e.city ?? '',
      country:          e.country ?? '',
      postalCode:       e.postalCode ?? '',
      basicSalary:      e.basicSalary ?? null,
      allowancesAmount: e.allowancesAmount ?? null,
      bankName:         e.bankName ?? '',
      bankAccount:      e.bankAccount ?? '',
      isActive:         e.isActive,
      employmentStatus: e.employmentStatus ?? 'active',
    });
  }

  // ── File selection ────────────────────────────────────────────────────────
  onFileSelected(event: any): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  removeFileSelection(): void {
    this.selectedFile = null;
  }

  uploadDocument(): void {
    // if (!this.selectedFile) return;
    // this.uploadingDoc = true;
    // this.svc
    //   .uploadDocument(this.empId, this.selectedFile)
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe({
    //     next: (doc: any) => {
    //       this.documents = [...this.documents, doc];
    //       this.selectedFile = null;
    //       this.uploadingDoc = false;
    //       this.snack.open(`Document "${doc.docName}" uploaded.`, 'OK', { duration: 3000 });
    //     },
    //     error: (err: any) => {
    //       this.uploadingDoc = false;
    //       this.snack.open('Document upload failed.', 'Dismiss', { duration: 4000 });
    //     },
    //   });
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const v = this.form.getRawValue() as any;
    const formData = new FormData();

    Object.keys(v).forEach((key: string) => {
      formData.append(key, v[key] ?? '');
    });

    Object.keys(this.employee || {}).forEach(key => {
      if (!formData.has(key)) {
        formData.append(key, this.employee[key] ?? '');
      }
    });

    if (this.selectedPhoto) {
      formData.append('profilePhotoFile', this.selectedPhoto);
    }

    this.submitting = true;
    this.svc
      .update(this.empId, formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snack.open('Employee updated successfully.', 'OK', { duration: 3000 });
          this.submitting = false;
          this.router.navigate(['/employees']);
        },
        error: (err: any) => {
          const msg = err?.error?.error ?? 'Failed to update employee.';
          this.snack.open(msg, 'Dismiss', { duration: 5000 });
          this.submitting = false;
        },
      });
  }

  // ── Field helpers ──────────────────────────────────────────────────────────
  hasError(field: string, error: string): boolean {
    const ctrl = this.form.get(field) as AbstractControl;
    return ctrl?.hasError(error) && (ctrl.dirty || ctrl.touched);
  }

  managerLabel(emp: any): string {
    const code = emp.empCode || emp.empID;
    const name = `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
    return `${code} - ${name}`;
  }

  setManagerSearch(managerID: number | null): void {
    if (!managerID) {
      this.managerSearch = '';
      return;
    }

    const manager = this.employees.find(emp => emp.empID === managerID);
    this.managerSearch = manager ? this.managerLabel(manager) : '';
  }

  selectManager(): void {
    const selected = this.employees.find(emp =>
      this.managerLabel(emp).toLowerCase() === this.managerSearch.trim().toLowerCase()
    );

    this.form.patchValue({
      managerID: selected ? selected.empID : null
    });
  }

  onBranchChange(): void {
    const branchID = this.form.get('branchID')?.value;
    const selected = this.branches.find(branch =>
      Number(branch.branchID) === Number(branchID)
    );

    this.form.patchValue({
      workLocation: selected?.location || selected?.branchName || ''
    });
  }

  onCountryChange(): void {
    this.onPostalCodeChange();
  }

  onPostalCodeChange(): void {
    const country = String(this.form.get('country')?.value || '').trim();
    const postalCode = String(this.form.get('postalCode')?.value || '').trim();
    this.addressMessage = '';

    if (!country || !postalCode) {
      return;
    }

    const city = this.postalCityMap[country]?.[postalCode];

    if (city) {
      this.form.patchValue({ city });
      this.addressMessage = 'City filled from postal code.';
      return;
    }

    if (country === 'United Arab Emirates') {
      this.addressMessage = 'UAE normally uses PO Box / area instead of fixed pincode. Please type city manually.';
      return;
    }

    this.addressMessage = 'Postal lookup table is not connected for this country yet. Please type city manually.';
  }

  readonly genders = ['Male', 'Female', 'Other', 'Prefer not to say'];
  readonly employmentTypes = [
    { value: 'full_time', label: 'Full Time' },
    { value: 'part_time', label: 'Part Time' },
    { value: 'contract',  label: 'Contract' },
    { value: 'intern',    label: 'Intern' },
  ];
  readonly employmentStatuses = [
    { value: 'active',     label: 'Active' },
    { value: 'inactive',   label: 'Inactive' },
    { value: 'on_leave',   label: 'On Leave' },
    { value: 'terminated', label: 'Terminated' },
  ];

  private profilePhotoUrl(photo: string): string {
    if (photo.startsWith('http')) {
      return photo;
    }

    return `${API_BASE_URL}${photo.startsWith('/') ? '' : '/'}${photo}`;
  }
}
