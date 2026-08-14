import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthSessionService } from '../../../../core/services/auth-session.service';

import { BranchCreateComponent } from './branch-create.component';

describe('BranchCreateComponent', () => {
  let component: BranchCreateComponent;
  let fixture: ComponentFixture<BranchCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BranchCreateComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: AuthSessionService,
          useValue: { companyId: 1, userId: 1 },
        },
      ],
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BranchCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
