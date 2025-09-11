import {  Component, inject } from '@angular/core';
import { NgClass, NgFor, NgSwitch, NgSwitchCase } from '@angular/common';
import { ToasterService } from '../../services/toaster/toaster.service';


@Component({
  selector: 'app-toaster',
  standalone: true,
  imports: [NgClass,NgFor, NgSwitch,NgSwitchCase],
  templateUrl: './toaster.component.html',
  styles: [
    `
    .animate-fade-in {
      animation: fadeIn 0.3s ease-in-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-5px); }
      to { opacity: 1; transform: translateY(0); }
    }
    `,
  ],
})
export class ToasterComponent {
  toasterService = inject(ToasterService);

  undoAction(id: number) {
    alert(`Undo action for toast #${id}`);
    this.toasterService.dismiss(id);
  }
}
