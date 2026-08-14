import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthSessionService } from '../../../../core/services/auth-session.service';

import { BranchListComponent } from './branch-list.component';

describe('BranchListComponent', () => {
  let component: BranchListComponent;
  let fixture: ComponentFixture<BranchListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BranchListComponent],
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
    
    fixture = TestBed.createComponent(BranchListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
