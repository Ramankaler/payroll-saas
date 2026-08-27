import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { DepartmentService } from '../../../departments/services/department.service';
import { DesignationService } from '../../../designations/services/designation.service';
import { EmployeeService } from '../../employee.service';
import { DepartmentDialogComponent } from '../../../departments/components/department-dialog/department-dialog.component';
import { DesignationDialogComponent } from '../../../designations/components/designation-dialog/designation-dialog.component';
import { Router } from '@angular/router';
import { BranchService } from '../../../branches/services/branch.service';
import { AuthSessionService } from '../../../../core/services/auth-session.service';
import { Shift, ShiftService } from '../../../shifts/services/shift.service';

@Component({
  selector: 'app-employee-create',
  standalone: true,
  imports: [
    CommonModule,  FormsModule,  MatDialogModule,  MatTabsModule,
    MatButtonModule,  MatIconModule
  ],
  templateUrl: './employee-create.component.html'
})
export class EmployeeCreateComponent {
  private readonly authSession =   inject(AuthSessionService);
  departments: any[] = [];
  designations: any[] = [];
  documents: any[] = [];
  doc: any = {};
  otherDocuments: any[] = [];
  otherDoc: any = {};
  docFile: File | null = null;
  otherFile: File | null = null;
  isSaving = false;
  successMessage = '';
  eduFile: File | null = null;
  employees: any[] = [];
  managerSearch = '';
  loadingManagers = false;
  private managerSearchTimer: any = null;
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

  // ================= EMPLOYEE OBJECT =================
    employee: any = {
    empCode: '',
    bioID: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    dob: null,

    deptID: null,
    desigID: null,
    managerID: null,
    joiningDate: null,
    workLocation: '',

    employmentType: null,
    employmentStatus: 'Active',
    shiftID: null,

    basicSalary: null,
    allowancesAmount: null,

    bankName: '',
    bankAccount: '',
    paymentMode: null,

    taxNumber: '',

    maritalStatus: '',
    nationality: '',
    nationalId: '',
    passportNo: '',

    addressLine1: '',
    addressLine2: '',
    city: '',
    country: '',
    postalCode: '',

    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyRelation: '',

    profilePhoto: '',

    compID: this.authSession.companyId,
    isActive: true
  };

  // ================= PROFILE PHOTO =================
  selectedPhoto: File | null = null;
  previewUrl: string | null = null;

  // ================= EDUCATION =================
  educationList: any[] = [];
  education: any = {
    qualification: '',
    institute: '',
    year: '',
    percentage: ''
  };

  // ================= EXPERIENCE =================
    experienceList: any[] = [];
    experience: any = {
      companyName: '',
      designation: '',
      startDate: '',
      endDate: ''
    };

branches: any[] = [];
shifts: Shift[] = [];

  constructor(
    private deptSrv: DepartmentService,    private desigSrv: DesignationService,
    private empSrv: EmployeeService,    private dialog: MatDialog,
    private router : Router,    private branchService: BranchService,
    private shiftService: ShiftService
    ) {}

  ngOnInit() {
    this.loadDepartments();
    this.loadDesignations();
    this.loadEmployees();
    this.branchService.getAll(this.authSession.companyId).subscribe(res => {
  this.branches = res;
});
    this.loadShifts();
  }

  // ================= LOAD DATA =================
  loadDepartments() {
    this.deptSrv.getAll(this.authSession.companyId).subscribe({
      next: (res: any) => this.departments = res || []
    });
  }

  loadDesignations() {
    this.desigSrv.getAll(this.authSession.companyId).subscribe({
      next: (res: any) => this.designations = res || []
    });
  }

  loadShifts() {
    this.shiftService.getAll(this.authSession.companyId).subscribe({
      next: shifts => {
        this.shifts = shifts.filter(shift => shift.isActive);
      }
    });
  }

  loadEmployees() {
    this.loadingManagers = true;

    this.empSrv.lookup(this.managerSearch, 20).subscribe({
      next: (res: any[]) => {
        this.employees = res || [];
        this.loadingManagers = false;
      },
      error: () => {
        this.employees = [];
        this.loadingManagers = false;
      },
    });
  }

  onManagerSearchChanged() {
    this.employee.managerID = null;

    if (this.managerSearchTimer) {
      clearTimeout(this.managerSearchTimer);
    }

    this.managerSearchTimer = setTimeout(() => {
      this.loadEmployees();
    }, 300);
  }

  setNextEmployeeCode() {
    if (this.employee.empCode) {
      return;
    }

    const now = new Date();
    const year = String(now.getFullYear()).slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `${year}${month}`;

    const numericCodes = this.employees
      .map(emp => String(emp.empCode || '').trim())
      .filter(code => code.startsWith(prefix))
      .map(code => code.slice(prefix.length))
      .filter(code => /^\d+$/.test(code));

    const maxCode = numericCodes.length
      ? Math.max(...numericCodes.map(code => Number(code)))
      : 0;

    this.employee.empCode =
      `${prefix}${String(maxCode + 1).padStart(3, '0')}`;
  }

  managerLabel(emp: any): string {
    const code = emp.empCode || emp.empID;
    const name = `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
    return `${code} - ${name}`;
  }

  selectManager() {
    const selected = this.employees.find(emp =>
      this.managerLabel(emp).toLowerCase() === this.managerSearch.trim().toLowerCase()
    );

    this.employee.managerID = selected ? selected.empID : null;
  }

  onBranchChange() {
    const selected = this.branches.find(branch =>
      Number(branch.branchID) === Number(this.employee.branchID)
    );

    this.employee.workLocation = selected?.location || selected?.branchName || '';
  }

  onCountryChange() {
    this.onPostalCodeChange();
  }

  onPostalCodeChange() {
    const country = String(this.employee.country || '').trim();
    const postalCode = String(this.employee.postalCode || '').trim();
    this.addressMessage = '';

    if (!country || !postalCode) {
      return;
    }

    const city = this.postalCityMap[country]?.[postalCode];

    if (city) {
      this.employee.city = city;
      this.addressMessage = 'City filled from postal code.';
      return;
    }

    if (country === 'United Arab Emirates') {
      this.addressMessage = 'UAE normally uses PO Box / area instead of fixed pincode. Please type city manually.';
      return;
    }

    this.addressMessage = 'Postal lookup table is not connected for this country yet. Please type city manually.';
  }

  // ================= PHOTO =================
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

  // ================= SAVE =================
 saveEmployee() {

  if (!this.employee.firstName || !this.employee.email || !this.employee.phone) {
    alert('Please fill required fields');
    return;
  }

  this.isSaving = true;
  const formData = new FormData();
  Object.keys(this.employee).forEach(key => {
    formData.append(key, this.employee[key] ?? '');
  });

  if (this.selectedPhoto) {
    formData.append('profilePhoto', this.selectedPhoto);
  }

  // STEP 1: SAVE EMPLOYEE
  this.empSrv.create(formData).subscribe({

    next: (res: any) => {

      const empId = res.empID;

      // 🔹 helper function to upload docs
      const upload = (fd: FormData) => this.empSrv.uploadDocument(fd);

      const uploads: any[] = [];

      // MAIN DOCS
      this.documents.forEach(d => {
        if (!d.file) return;
        const fd = new FormData();
        fd.append('empId', empId);
        fd.append('file', d.file);
        fd.append('docType', d.docType || '');
        fd.append('documentName', d.docNumber || '');
        fd.append('issueDate', d.issueDate || '');
        fd.append('expiryDate', d.expiryDate || '');
        uploads.push(upload(fd));
      });

      // EDUCATION DOCS
      this.educationList.forEach(e => {
        if (!e.file) return;
        const fd = new FormData();
        fd.append('empId', empId);
        fd.append('file', e.file);
        fd.append('docType', 'Education');
        fd.append('documentName', e.qualification || '');
        uploads.push(upload(fd));
      });

      // EXPERIENCE DOCS
      this.experienceList.forEach(e => {
        if (!e.file) return;
        const fd = new FormData();
        fd.append('empId', empId);
        fd.append('file', e.file);
        fd.append('docType', 'Experience');
        fd.append('documentName', e.companyName || '');
        uploads.push(upload(fd));
      });
      // WAIT FOR ALL UPLOADS
      if (uploads.length > 0) {
        Promise.all(uploads.map(u => u.toPromise()))
          .then(() => this.finishSuccess())
          .catch(() => this.finishSuccess()); // even if some fail
      } else {
        this.finishSuccess();
      }
    },
    error: (err) => {
      this.isSaving = false;
      console.error(err);
      this.successMessage = '';
      alert('Error saving employee');
    }
  });
}
finishSuccess(){
    this.isSaving = false;
  this.successMessage = 'Employee saved successfully!';

  setTimeout(() => {
    this.router.navigate(['/employees']);
  }, 1200);
}
  // ================= RESET =================
  resetForm() {
    this.employee = {
      empCode: '',
      bioID: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      gender: '',
      dob: null,

      deptID: null,
      desigID: null,
      managerID: null,
      joiningDate: null,
      workLocation: '',

      employmentType: null,
      employmentStatus: 'Active',
      shiftID: null,

      basicSalary: null,
      allowancesAmount: null,

      bankName: '',
      bankAccount: '',
      paymentMode: null,

      taxNumber: '',

      maritalStatus: '',
      nationality: '',
      nationalId: '',
      passportNo: '',

      addressLine1: '',
      addressLine2: '',
      city: '',
      country: '',
      postalCode: '',

      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyRelation: '',

      profilePhoto: '',

      compID: this.authSession.companyId,
      isActive: true
    };

    this.educationList = [];
    this.experienceList = [];
    this.managerSearch = '';
    this.addressMessage = '';

    this.previewUrl = null;
    this.selectedPhoto = null;
  }
  // ================= EDUCATION =================
addEducation() {
  if (!this.education.qualification) return;

  this.educationList.push({
    ...this.education,
    file: this.eduFile,
    fileName: this.eduFile?.name
  });
  this.education = {
    qualification: '',
    institute: '',
    year: '',
    percentage: ''
  };
  this.eduFile = null;
}
  removeEducation(index: number) {
    this.educationList.splice(index, 1);
  }
  // ================= EXPERIENCE =================
 addExperience() {
  if (!this.experience.companyName) return;
  this.experienceList.push({
    ...this.experience,
    file: this.expFile,
    fileName: this.expFile?.name
  });
  this.experience = {
    companyName: '',
    designation: '',
    startDate: '',
    endDate: ''
  };
  this.expFile = null;
}
  removeExperience(index: number) {
    this.experienceList.splice(index, 1);
  }
onDocFileChange(e: any) {
  this.docFile = e.target.files[0];
}

addDocument() {
  this.documents.push({
    ...this.doc,
    file: this.docFile,
    fileName: this.docFile?.name
  });
  this.doc = {};
  this.docFile = null;
}
removeDocument(i: number) {
  this.documents.splice(i, 1);
}
onOtherFileChange(e: any) {
  this.otherFile = e.target.files[0];
}
addOtherDocument() {
  this.otherDocuments.push({
    ...this.otherDoc,
    file: this.otherFile,
    fileName: this.otherFile?.name
  });
  this.otherDoc = {};
  this.otherFile = null;
}
removeOtherDocument(i: number) {
  this.otherDocuments.splice(i, 1);
}
onEduFileChange(e: any) {
  this.eduFile = e.target.files[0];
}
expFile: File | null = null;

onExpFileChange(e: any) {
  this.expFile = e.target.files[0];
}

openDeptDialog() {
  const dialogRef = this.dialog.open(DepartmentDialogComponent);

  dialogRef.afterClosed().subscribe(res => {
    if (res) {
      this.loadDepartments(); // refresh dropdown
    }
  });
}

openDesigDialog() {
  const dialogRef = this.dialog.open(DesignationDialogComponent);

  dialogRef.afterClosed().subscribe(res => {
    if (res) {
      this.loadDesignations();
    }
  });
}


removePhoto() {
  this.previewUrl = null;
  this.selectedPhoto = null;
  this.employee.profilePhoto = '';
}

}
