import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  private isVisible = new BehaviorSubject<boolean>(true);
  isVisible$ = this.isVisible.asObservable();

  show(): void {
    this.isVisible.next(true);
  }

  hide(): void {
    this.isVisible.next(false);
  }
}
