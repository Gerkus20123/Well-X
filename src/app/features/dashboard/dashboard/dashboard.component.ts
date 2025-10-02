// src/app/features/dashboard/dashboard/dashboard.component.ts

import { Component, OnInit } from '@angular/core';
import { WellBeingDataService, DailyActivity } from '../../../core/services/well-being-data.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  template: `
    <h2 class="text-2xl font-bold text-black mb-4 text-left header-gradient-border rounded-lg p-5">Pulpit: Well-X </h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2">
      <div> 
        <h2 class="text-xl font-bold bg-gray-300 text-black mb-4 text-center rounded-lg p-2 ml-0">Statystyki </h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-200 rounded-lg ml-0 ">

          <div class="shadow-lg p-4 text-center bg-white rounded-lg">
            <span class="material-icons text-indigo-600 mb-2 text-4xl">trending_up</span>
            <h3 class="text-xl font-semibold">Całkowite Przerwy</h3>
            <p class="text-3xl font-bold text-indigo-700">{{ totalBreaks }}</p>
            <p class="text-sm text-gray-500">Zarejestrowane dzisiaj</p>
          </div>

          <div class="shadow-lg p-4 text-center bg-white rounded-lg">
            <span class="material-icons text-green-600 mb-2 text-4xl">directions_run</span>
            <h3 class="text-xl font-semibold">Kroki Dzisiaj</h3>
            <p class="text-3xl font-bold text-green-700">{{ todaySteps }}</p>
            <p class="text-sm text-gray-500">Ostatnia aktualizacja</p>
          </div>

          <div class="shadow-lg p-4 text-center bg-white rounded-lg">
            <span class="material-icons text-yellow-600 mb-2 text-4xl">hourglass_empty</span>
            <h3 class="text-xl font-semibold">Ostatnia Przerwa</h3>
            <!-- ZMIANA: Wyświetlanie obliczonego czasu "minut temu" -->
            <p class="text-xl font-bold text-yellow-700">{{ lastBreakDisplay || 'Brak przerw dziś' }}</p>
            <p class="text-sm text-gray-500">Pamiętaj o regularnej regeneracji</p>
          </div>

        </div>
      </div>
        
      <div>
        <div class="lg:col-span-1 ml-20">
            <app-clock></app-clock>
        </div>
      </div>

    </div>
  `,
})
export class DashboardComponent implements OnInit { 
  totalBreaks: number = 0;
  todaySteps: number = 0;
  lastBreakTime: string | null = null;
  lastBreakDisplay: string | null = null;
  todayDate: string;

  constructor(private dataService: WellBeingDataService) {
    this.todayDate = new Date().toISOString().slice(0, 10);
  }

  private calculateTimeAgo(breakTime: string): string {
    if (!breakTime) return 'Brak';
    
    const now = new Date();
    const breakDate = new Date();

    const [hoursStr, minutesStr] = breakTime.split(':');
    const breakHours = parseInt(hoursStr, 10);
    const breakMinutes = parseInt(minutesStr, 10);
    
    breakDate.setHours(breakHours, breakMinutes, 0, 0);

    const diffInMilliseconds = now.getTime() - breakDate.getTime();
    
    if (diffInMilliseconds < 0) {
      return `o ${breakTime}`;
    }

    const minutesAgo = Math.floor(diffInMilliseconds / (1000 * 60));

    if (minutesAgo < 1) {
      return `teraz`;
    } else if (minutesAgo === 1) {
      return `1 minutę temu`;
    } else if (minutesAgo <= 59) {
      return `${minutesAgo} minut temu`;
    } else {
      return `o ${breakTime}`;
    }
  }

  ngOnInit(): void {
    this.dataService.dailyActivity$
      .pipe(
        // Mapowanie danych do stanu komponentu
        map(activities => activities.find(a => a.date === this.todayDate))
      )
      .subscribe(todayActivity => {
        if (todayActivity) {
          this.totalBreaks = todayActivity.breaks.length;
          this.todaySteps = todayActivity.steps;
          const lastBreak = todayActivity.breaks[todayActivity.breaks.length - 1];
          this.lastBreakTime = lastBreak || null;
          
          this.lastBreakDisplay = this.calculateTimeAgo(this.lastBreakTime || '');

        } else {
          this.totalBreaks = 0;
          this.todaySteps = 0;
          this.lastBreakTime = null;
          this.lastBreakDisplay = null;
        }
      });
      
    // Uruchomienie interwału co 60 sekund, aby odświeżać "X minut temu"
    setInterval(() => {
      if (this.lastBreakTime) {
        this.lastBreakDisplay = this.calculateTimeAgo(this.lastBreakTime);
      }
    }, 60000); // 60 sekund
  }
}
