import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../environments/environment.development';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    AsyncPipe,
    NgFor,
    RouterOutlet,
    HttpClientModule,
    ReactiveFormsModule,
    NgIf
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private summaries = new BehaviorSubject<VideoSummary[] | null>(null);
  summaries$ = this.summaries.asObservable();
  loading: boolean = false;

  private isDisplayDialog = new BehaviorSubject<boolean>(false);
  isDisplayDialog$ = this.isDisplayDialog.asObservable();

  form = this.fb.group({
    url: ['', Validators.required],
    myKey: ['', Validators.required],
  });

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  requestVideoSummary() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    this.http
      .post(`${environment.backUrl}/news-summary`, {
        youtubeUrl: this.form.value.url,
        key: this.form.value.myKey,
      })
      .subscribe((response: any) => {
        const data = response.data as VideoSummary[];
        this.summaries.next(data);
        this.loading = false;
      });
  }

  getThumbnail(url: string): string {
    const videoId = this.getVideoId(url);
    return `https://img.youtube.com/vi/${videoId}/0.jpg`;
  }

  getVideoId(url: string): string {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('v') || '';
  }

  openDialog(): void {
    this.isDisplayDialog.next(true);
  }

  closeDialog() {
    this.isDisplayDialog.next(false);
  }
}

interface VideoSummary {
  summary: string;
  source: {
    source: string;
    start_seconds: number;
    start_timestamp: string;
  };
}
