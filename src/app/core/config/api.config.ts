export const API_BASE_URL = 'http://localhost:5236';

// export const API_BASE_URL = 'https://backend-production-574e.up.railway.app';

export const API_ROUTES = {
  login: `${API_BASE_URL}/api/auth/login`,
  refresh: `${API_BASE_URL}/api/auth/refresh`,
  register: `${API_BASE_URL}/api/auth/register`,
  companiesMe: `${API_BASE_URL}/api/companies/me`,
  employees: `${API_BASE_URL}/api/employees`,
  // Employee module (EmployeeController)
  employeeBase: `${API_BASE_URL}/api/employee`,
  employeeDetail: (id: number) => `${API_BASE_URL}/api/employee/detail/${id}`,
  employeeByCompany: (compId: number) => `${API_BASE_URL}/api/employee/${compId}`,
  employeeUpdate: (id: number) => `${API_BASE_URL}/api/employee/${id}`,
  employeeDelete: (id: number) => `${API_BASE_URL}/api/employee/${id}`,
  employeeStatus: (id: number) => `${API_BASE_URL}/api/employee/status/${id}`,
  employeeToggle: (id: number) => `${API_BASE_URL}/api/employee/${id}/toggle-active`,
  employeeSearch: `${API_BASE_URL}/api/employee/search`,
  employeeUploadDoc: `${API_BASE_URL}/api/employee/upload-document`,
  employeeDocuments: (empId: number) => `${API_BASE_URL}/api/employee/documents/${empId}`,
  // Department & Designation
  departmentByCompany: (compId: number) => `${API_BASE_URL}/api/department/${compId}`,
  designationByCompany: (compId: number) => `${API_BASE_URL}/api/designation/${compId}`,
  attendanceImport: `${API_BASE_URL}/api/attendance/import`,
  attendanceReport: `${API_BASE_URL}/api/attendance/report`,
  leaveApply: `${API_BASE_URL}/api/leave/apply`,
  leaveApprove: `${API_BASE_URL}/api/leave/approve`,
  payrollRun: `${API_BASE_URL}/api/payroll/run`,
  payrollReport: `${API_BASE_URL}/api/payroll/report`,
  reportsAttendance: `${API_BASE_URL}/api/reports/attendance`,
  adminSettings: `${API_BASE_URL}/api/admin/settings`,
  // aiChat: `${API_BASE_URL}/api/ai/chat`,
  aiChat: `${API_BASE_URL}/api/agent/chat`,
} as const;

