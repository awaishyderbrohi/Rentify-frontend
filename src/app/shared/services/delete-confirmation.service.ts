import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ConfirmationData {
  message: string;
  isOpen: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  private confirmationSubject = new BehaviorSubject<ConfirmationData>({
    message: '',
    isOpen: false
  });

  private resolvePromise: ((value: boolean) => void) | null = null;

  confirmation$ = this.confirmationSubject.asObservable();

  confirm(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.resolvePromise = resolve;
      this.confirmationSubject.next({
        message,
        isOpen: true
      });
    });
  }

  confirmAction(confirmed: boolean) {
    this.confirmationSubject.next({
      message: '',
      isOpen: false
    });

    if (this.resolvePromise) {
      this.resolvePromise(confirmed);
      this.resolvePromise = null;
    }
  }
}
