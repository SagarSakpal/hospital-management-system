import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MedicalRecordsService } from '../../core/services/medical-records.service';
import { MedicalRecordDto } from '../../shared/models/medical-record.model';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { TokenStorageService } from '../../core/auth/token-storage.service';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-record-view',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressBarModule,
    MatSnackBarModule,
    DatePipe
  ],
  templateUrl: './record-view.component.html',
  styleUrls: ['./record-view.component.scss']
})
export class RecordViewComponent implements OnInit {

  role: string | null = null;
  id!: number;
  rec!: MedicalRecordDto;
  loading = false;

  constructor(
    private svc: MedicalRecordsService,
    private route: ActivatedRoute,
    private router: Router,
    private snack: MatSnackBar,
    private auth: AuthService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private tokenStorage: TokenStorageService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.role = this.auth.getRole();
    this.id = +(this.route.snapshot.paramMap.get('id')!);
    console.log('RecordViewComponent - Loading record ID:', this.id);
    this.fetch();
  }

  fetch() {
    this.loading = true;
    console.log('RecordViewComponent - Fetching record:', this.id);
    this.svc.get(this.id).subscribe({
      next: r => { 
        console.log('RecordViewComponent - Received record:', r);
        this.rec = r; 
        this.loading = false;
        this.cdr.detectChanges();
        console.log('RecordViewComponent - View updated, rec:', this.rec);
      },
      error: err => { 
        console.error('RecordViewComponent - Failed to load record:', err);
        this.loading = false; 
        this.cdr.detectChanges();
        this.snack.open('Failed to load record', 'OK', { duration: 3000 }); 
      }
    });
  }

  canManage(): boolean {
    return this.role === 'Admin' || this.role === 'Doctor' || this.role === 'Nurse';
  }

  canArchive(): boolean {
    return this.role === 'Admin';
  }

  openAttachment(): void {
    if (!this.rec?.attachmentUrl || !this.rec?.id) {
      console.log('No attachment to open');
      return;
    }
    
    // Use the API endpoint to download with authentication
    const downloadUrl = `${environment.apiBaseUrl}/medical-records/${this.rec.id}/attachment`;
    
    console.log('=== ATTACHMENT DOWNLOAD START ===');
    console.log('Downloading attachment via API:', downloadUrl);
    console.log('Record ID:', this.rec.id);
    console.log('Attachment URL in record:', this.rec.attachmentUrl);
    console.log('Current token exists:', !!this.tokenStorage.getAccessToken());
    
    // Download via authenticated HTTP request, then open as blob
    this.http.get(downloadUrl, { responseType: 'blob', observe: 'response' }).subscribe({
      next: (response) => {
        console.log('=== ATTACHMENT DOWNLOAD SUCCESS ===');
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers.keys());
        console.log('Content-Type:', response.headers.get('content-type'));
        
        const blob = response.body;
        if (!blob) {
          console.error('No blob in response');
          this.snack.open('No file data received', 'OK', { duration: 3000 });
          return;
        }
        
        console.log('Blob size:', blob.size, 'Blob type:', blob.type);
        
        // Check if blob is actually HTML (error page)
        if (blob.type.includes('html')) {
          console.error('ERROR: Received HTML instead of file!');
          // Read the HTML to see what it says
          blob.text().then(text => {
            console.error('HTML content:', text.substring(0, 500));
          });
          this.snack.open('Server returned error page instead of file', 'OK', { duration: 5000 });
          return;
        }
        
        const blobUrl = window.URL.createObjectURL(blob);
        console.log('Created blob URL:', blobUrl);
        const newWindow = window.open(blobUrl, '_blank');
        console.log('Window opened successfully:', !!newWindow);
        
        if (!newWindow) {
          console.error('Popup blocked!');
          this.snack.open('Popup blocked. Please allow popups for this site.', 'OK', { duration: 5000 });
        }
        
        // Clean up blob URL after opening
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 2000);
      },
      error: (err) => {
        console.error('=== ATTACHMENT DOWNLOAD ERROR ===');
        console.error('Error status:', err.status);
        console.error('Error statusText:', err.statusText);
        console.error('Error message:', err.message);
        console.error('Full error object:', err);
        
        if (err.status === 401) {
          console.error('AUTHENTICATION FAILED - Token might be invalid');
        } else if (err.status === 404) {
          console.error('FILE NOT FOUND - Check if file exists on server');
        }
        
        this.snack.open(`Failed to download: ${err.status} ${err.statusText}`, 'OK', { duration: 5000 });
      }
    });
  }

  edit() {
    if (!this.canManage()) return;
    this.router.navigate(['/records', this.id, 'edit']);
  }

  remove() {
    if (!this.canManage()) return;
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete record?', message: 'Soft delete. Continue?' }
    });
    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      this.svc.softDelete(this.id).subscribe({
        next: _ => { 
          this.snack.open('Record deleted','OK',{duration:2000}); 
          // Navigate back to main records list instead of patient-specific list
          this.router.navigate(['/records']); 
        },
        error: err => this.snack.open(err?.error?.detail || 'Delete failed', 'OK', { duration: 3000 })
      });
    });
  }

  toggleArchive() {
    if (!this.canArchive()) return;
    const archive = !this.rec.isArchived;
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: (archive ? 'Archive' : 'Unarchive') + ' record?', message: 'Proceed?' }
    });
    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      this.svc.archive(this.id, { archive }).subscribe({
        next: _ => { this.snack.open(archive ? 'Archived' : 'Unarchived', 'OK', { duration: 2000 }); this.fetch(); },
        error: err => this.snack.open(err?.error?.detail || 'Action failed', 'OK', { duration: 3000 })
      });
    });
  }
}