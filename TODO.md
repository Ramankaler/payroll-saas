# Angular Payroll App - Compilation Fix Plan

## Status: [IN PROGRESS] 

**Goal**: Fix all TypeScript/HTML compilation errors using beginner-friendly `any` types

## Step-by-Step Plan

### ✅ 1. Create this TODO.md [COMPLETED]

### ✅ 2. Fix EmployeeService 
**File**: `src/app/features/employees/employee.service.ts`
- [x] Add 9 missing methods: create(), getById(), getDepartments(), getDesignations(), getDocuments(), uploadDocument(), update(), delete(), toggleActive()
- Status: ✅ Employee service complete

### ✅ 3. Fix EmployeeCreateComponent
**File**: `src/app/features/employees/components/employee-create/employee-create.component.ts`
- [x] Add missing `onFileSelected()` method  
- Status: ✅ Create form compiles

### ✅ 4. Fix EmployeeEditComponent  
**File**: `src/app/features/employees/components/employee-edit/employee-edit.component.ts`
- [x] Remove all type imports (EmployeeDto, etc.)
- [x] Fix parameter types: `(event: any)`, `(doc: any)`
- [x] Replace EmployeeUpdateRequest with `any`
- Status: ✅ Edit form compiles + document upload

### ⬜ 5. Fix EmployeeListComponent
**File**: `src/app/features/employees/components/employee-list/employee-list.component.ts`
- [ ] Remove EmployeeDto import  
- [ ] dataSource: MatTableDataSource<any>
- Status: Employee list compiles

### ✅ 6. Fix ReimbursementListComponent
**File**: `src/app/features/reimbursement/components/reimbursement-list/reimbursement-list.component.ts`
- [x] Add CommonModule, FormsModule, RouterLink imports
- Status: ✅ *ngFor, ngModel, pipes, routerLink work

### ✅ 7. Fix Dialog Warnings
**Files**: department-dialog.component.ts, designation-dialog.component.ts
- [x] Replace `data?.` with `data.` (6 places)
- Status: ✅ No more NG8107 warnings

### ⬜ 8. Test Compilation
**Command**: `ng serve`
- [ ] All errors/warnings resolved
- [ ] Employee module fully functional

## Backend Note
- Backend in `d:/PAYROLL/payrollAPI` uses models directly (no DTOs) ✓
- No backend changes unless absolutely required

## Quick Test
```bash
ng serve
```
Visit http://localhost:4200/employees

**Next Step**: EmployeeService implementation → Mark as [COMPLETED] after each step

