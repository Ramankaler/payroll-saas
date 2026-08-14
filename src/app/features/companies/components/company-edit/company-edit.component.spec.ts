import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { CompanyEditComponent } from './company-edit.component';

describe('CompanyEditComponent', () => {
  let component: CompanyEditComponent;
  let fixture: ComponentFixture<CompanyEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyEditComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CompanyEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
