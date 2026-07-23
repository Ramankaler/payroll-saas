import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private requestCount = 0;
  private readonly loadingSubject = new BehaviorSubject(false);

  readonly loading$ = this.loadingSubject.asObservable();

  show(): void {
    this.requestCount++;
    this.loadingSubject.next(true);
  }

  hide(): void {
    this.requestCount = Math.max(this.requestCount - 1, 0);
    this.loadingSubject.next(this.requestCount > 0);
  }
}
