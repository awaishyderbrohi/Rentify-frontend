// src/app/toaster/toaster.service.ts
import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'warning' | 'error' | 'info' | 'neutral';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class ToasterService {
  private counter = 0;
  toasts = signal<Toast[]>([]);

  show(message: string, type: ToastType, duration: number = 4000) {
    const id = ++this.counter;
    const newToast: Toast = { id, message, type, duration };
    this.toasts.update((list) => [...list, newToast]);

    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
  }

  dismiss(id: number) {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }

  clearAll() {
    this.toasts.set([]);
  }
}
