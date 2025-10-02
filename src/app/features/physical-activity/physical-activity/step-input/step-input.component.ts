import { Component } from '@angular/core';
import { WellBeingDataService } from '../../../../core/services/well-being-data.service';

@Component({
  selector: 'app-step-input',
  standalone: false,
  template: `
    
    <div class="rounded-lg p-6 bg-white">
      <h4 class="text-lg font-semibold mb-6 text-center">Zaktualizuj Liczbę Kroków</h4>
      
      <div class="mb-4 w-3/4 mx-auto">
        <label class="block text-sm font-medium mb-3 ml-1">Kroki dzisiaj</label>
        <input type="number" [(ngModel)]="todaySteps" placeholder="Wprowadź liczbę kroków"
               class="w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
      </div>

      <div class="flex justify-end">
        <button (click)="submitSteps()" [disabled]="!todaySteps || todaySteps < 0"
                class="px-4 py-2 rounded transition duration-300 
                bg-gradient-to-r from-green-400 to-gray-500 hover:from-green-500 
                hover:to-gray-600 text-white disabled:opacity-50 disabled:cursor-not-allowed 
                hover:bg-green-700 mx-auto">
          Zapisz
        </button>
      </div>

    </div>
  `
})
export class StepInputComponent {
  
  todaySteps: number | null = null;
  
  constructor(private dataService: WellBeingDataService) { }

  submitSteps(): void {
    if (this.todaySteps !== null && this.todaySteps >= 0) {
      this.dataService.updateSteps(this.todaySteps);
      alert(`Zapisano ${this.todaySteps} kroków! Pulpit zostanie odświeżony.`);
      this.todaySteps = null;
    }
  }
}