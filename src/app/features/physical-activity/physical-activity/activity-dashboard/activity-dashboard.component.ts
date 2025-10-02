import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { DailyActivity, WellBeingDataService } from '../../../../core/services/well-being-data.service';

@Component({
  selector: 'app-activity-dashboard',
  standalone: false,
  template: `
  <h2 class="text-2xl font-bold text-black mb-4 text-left header-gradient-border rounded-lg p-5 w-2/3 mx-auto">Twoje Osiągnięcia Aktywności</h2>
    <div class="bg-white rounded-lg shadow-lg p-10 w-2/3 mx-auto">
      <div *ngIf="(historicalData$ | async) as data; else loading">
        <h4 class="font-medium mb-2 text-left ml-3">Ostatnie 5 Dni:</h4>

        <ul class="flex divide-x items-center justify-center">
          <li *ngFor="let day of data.slice(-5)" class="py-2 flex items-center space-x-2 mr-4">
            <span class="material-icons text-green-600 p-3">directions_walk</span>
            <div class="flex-1">
              <div class="font-medium text-center">{{ day.date }}</div>
              <div class="text-sm text-gray-600 text-left">Kroki: {{ day.steps | number }}</div> 
              <div class="text-sm text-gray-600 text-left"> Przerwy: {{ day.breaks }}</div>
            </div>
          </li>
        </ul>

        <div class="my-4 h-px bg-gray-200"></div>
        <app-step-input></app-step-input>
      </div>
      <ng-template #loading>
        <div class="flex items-center gap-3 text-gray-600">
          <span class="material-icons animate-spin">progress_activity</span>
          <span>Wczytywanie...</span>
        </div>
      </ng-template>
    </div>
  `
})
export class ActivityDashboardComponent implements OnInit {
  
  historicalData$!: Observable<DailyActivity[]>;

  constructor(private dataService: WellBeingDataService) { }

  ngOnInit(): void {
    this.historicalData$ = this.dataService.getHistoricalData();
  }
}