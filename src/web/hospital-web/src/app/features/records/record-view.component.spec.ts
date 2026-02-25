import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../core/auth/auth.service';
import { MedicalRecordsService } from '../../core/services/medical-records.service';
import { TokenStorageService } from '../../core/auth/token-storage.service';
import { HttpClient } from '@angular/common/http';
import { RecordViewComponent } from './record-view.component';

describe('RecordViewComponent', () => {
  let component: RecordViewComponent;
  let fixture: ComponentFixture<RecordViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordViewComponent],
      providers: [
        { provide: MedicalRecordsService, useValue: {} },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } },
        { provide: Router, useValue: { navigate: () => {} } },
        { provide: MatSnackBar, useValue: { open: () => {} } },
        { provide: AuthService, useValue: { getRole: () => 'Admin' } },
        { provide: MatDialog, useValue: { open: () => ({ afterClosed: () => ({ subscribe: () => {} }) }) } },
        { provide: TokenStorageService, useValue: { getAccessToken: () => 'token' } },
        { provide: HttpClient, useValue: { get: () => ({ subscribe: () => {} }) } }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecordViewComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
