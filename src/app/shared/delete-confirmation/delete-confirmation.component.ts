import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmationService } from '../services/delete-confirmation.service';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal" [class.modal-open]="(confirmationService.confirmation$ | async)?.isOpen">
      <div class="modal-box">
        <h3 class="font-bold text-lg">Confirm</h3>
        <p class="py-4">{{ (confirmationService.confirmation$ | async)?.message }}</p>
        <div class="modal-action">
          <button class="btn btn-ghost" (click)="onCancel()">Cancel</button>
          <button class="btn btn-primary" (click)="onConfirm()">OK</button>
        </div>
      </div>
      <div class="modal-backdrop" (click)="onCancel()"></div>
    </div>
  `
})
export class ConfirmationModalComponent {
  confirmationService = inject(ConfirmationService);

  onConfirm() {
    this.confirmationService.confirmAction(true);
  }

  onCancel() {
    this.confirmationService.confirmAction(false);
  }
}
