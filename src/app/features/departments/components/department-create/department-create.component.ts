import { Component, OnInit } from '@angular/core';
import { DepartmentService } from '../../services/department.service';
@Component({
  selector: 'app-department-create',
  templateUrl: './department-create.component.html',
  styleUrls: ['./department-create.component.scss']
})
export class DepartmentCreateComponent implements OnInit {
  constructor(private deptSrv: DepartmentService) {}
  ngOnInit(): void {}
}
