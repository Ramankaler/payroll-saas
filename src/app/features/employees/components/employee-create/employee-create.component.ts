import { Component } from '@angular/core';
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

  // ================= EMPLOYEE OBJECT =================
    employee: any = {
    empCode: '',
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

    compID: 1,
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

  constructor(
    private deptSrv: DepartmentService,    private desigSrv: DesignationService,
    private empSrv: EmployeeService,    private dialog: MatDialog,
    private router : Router,    private branchService: BranchService
    ) {}

  ngOnInit() {
    this.loadDepartments();
    this.loadDesignations();
    this.branchService.getAll(1).subscribe(res => {
  this.branches = res;
});
  }

  // ================= LOAD DATA =================
  loadDepartments() {
    this.deptSrv.getAll(1).subscribe({
      next: (res: any) => this.departments = res || []
    });
  }

  loadDesignations() {
    this.desigSrv.getAll(1).subscribe({
      next: (res: any) => this.designations = res || []
    });
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

  if (!this.employee.empCode || !this.employee.firstName || !this.employee.email || !this.employee.phone) {
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

      compID: 1,
      isActive: true
    };

    this.educationList = [];
    this.experienceList = [];

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
