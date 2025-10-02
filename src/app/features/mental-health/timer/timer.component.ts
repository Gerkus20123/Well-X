import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, interval, takeUntil, Observable } from 'rxjs';
import { WellBeingDataService } from '../../../core/services/well-being-data.service';
@Component({
  selector: 'app-timer',
  standalone: false,
  template: `
  <h2 class="text-2xl font-bold text-black mb-4 text-left 
             from-gray-200 to-gray-50 
             rounded-lg p-5 w-2/3 mx-auto 
             header-gradient-border">
    Zegar Przerwy / Mindfulness
  </h2>
  
    <div class="shadow-xl rounded-lg border border-gray-200 bg-white w-2/3 mx-auto">
      <div class="text-white p-4 rounded-t-lg">
      </div>
      <div class="p-6 space-y-10">
        <div class="text-6xl font-mono text-center">{{ remainingTime | date:'mm:ss' }}</div>

      <div class="h-5 w-3/4 mx-auto bg-gray-200 rounded">
        <div class="h-5 transition duration-300 bg-gradient-to-r from-orange-400 to-orange-300 rounded" [style.width.%]="progressPercent"></div>
      </div>

        <p *ngIf="isRunning" class="text-gray-700 text-center">Czas na relaks! Po zakończeniu przerwa zostanie zarejestrowana.</p>
        <p *ngIf="!isRunning && remainingTime === breakDuration" class="text-gray-700 text-center">Gotowy na 5 minut regeneracji?</p>
      </div>
      <div class="p-12 flex gap-3 justify-center">
      
        <button (click)="startPause()" [disabled]="isRunning"
                class="px-4 py-2 rounded 
                       bg-green-200 
                       text-white disabled:opacity-30 
                       transition duration-300 bg-gradient-to-r from-orange-400 to-gray-500 hover:from-orange-500 hover:to-gray-600 flex items-center gap-2">
          <span class="material-icons">play_arrow</span> Rozpocznij 5-minutową przerwę
        </button>

        <button (click)="reset()" [disabled]="!isRunning && remainingTime === breakDuration"
          class="px-4 py-2 rounded gradient-border flex items-center gap-2">
          <span class="material-icons">refresh</span> Reset
        </button>

      </div>
    </div>
  `
})
export class TimerComponent implements OnInit, OnDestroy {
  breakDuration: number = 5 * 60 * 1000; 
  remainingTime: number = this.breakDuration;
  isRunning: boolean = false;
  progressPercent: number = 0;
  
  private destroy$ = new Subject<void>();

  constructor(private dataService: WellBeingDataService) { }

  ngOnInit(): void {
    // Inicjalizacja komponentu
  }

  startPause(): void {
    if (!this.isRunning) {
      this.isRunning = true;
      
      // Tworzenie strumienia interwałowego
      interval(1000)
        .pipe(
          takeUntil(this.destroy$),
          takeUntil(this.isTimerFinished())
        )
        .subscribe(() => {
          this.remainingTime -= 1000;
          this.progressPercent = 100 - (this.remainingTime / this.breakDuration) * 100;
          
          if (this.remainingTime <= 0) {
            this.finishBreak();
          }
        });
    }
  }
  
  // Wewnętrzny Observable do zatrzymania timera, gdy skończy się czas
  private isTimerFinished(): Observable<boolean> {
    return new Observable<boolean>(observer => {
        if (this.remainingTime <= 0) {
            observer.next(true);
            observer.complete();
        }
    });
  }

  finishBreak(): void {
    this.destroy$.next();
    this.isRunning = false;
    const now = new Date();
    const breakTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    this.dataService.recordBreak(breakTime); 
    this.remainingTime = this.breakDuration; // Reset zegara
    this.progressPercent = 0;
    console.log(`Przerwa zakończona! Zarejestrowana w Twoim logu o ${breakTime}.`); 
  }

  reset(): void {
    this.destroy$.next(); 
    this.isRunning = false;
    this.remainingTime = this.breakDuration;
    this.progressPercent = 0;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
