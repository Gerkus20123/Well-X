import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { delay, map } from 'rxjs/operators';


export interface DailyActivity {
  date: string; 
  steps: number;
  breaks: string[]; 
}

@Injectable({
  providedIn: 'root'
})
export class WellBeingDataService {

  private readonly STORAGE_KEY = 'well_being_daily_activity';
  private getFormattedDate(date: Date): string {

    return date.toISOString().slice(0, 10);
  }

  private yesterday: string;
  private today: string;

  // Użycie BehaviorSubject do reaktywnego zarządzania stanem
  private activityDataSubject: BehaviorSubject<DailyActivity[]>;
  
  // Publiczny Observable dla komponentów
  public dailyActivity$: Observable<DailyActivity[]>;

  constructor() {
    const todayDate = new Date();
    this.today = this.getFormattedDate(todayDate);

    const yesterdayDate = new Date(todayDate);
    yesterdayDate.setDate(todayDate.getDate() - 1);
    this.yesterday = this.getFormattedDate(yesterdayDate);
    
    // 1. ŁADOWANIE DANYCH Z LOCAL STORAGE
    let loadedData = this.loadDataFromLocalStorage();

    if (loadedData.length === 0) {
      // 2. JEŚLI BRAK DANYCH W LOCAL STORAGE, GENERUJEMY WPISY POCZĄTKOWE
      console.log('Brak danych w localStorage. Generowanie danych początkowych (6 dni).');
      
      // Funkcja pomocnicza do generowania daty X dni temu
      const getDateXDaysAgo = (days: number): string => {
          const date = new Date(todayDate);
          date.setDate(todayDate.getDate() - days);
          return this.getFormattedDate(date);
      };

      loadedData = [
        { date: getDateXDaysAgo(5), steps: 4800, breaks: ['10:00', '14:00'] },
        { date: getDateXDaysAgo(4), steps: 6200, breaks: ['11:00'] },
        { date: getDateXDaysAgo(3), steps: 9100, breaks: ['09:30', '12:30', '15:30'] },
        { date: getDateXDaysAgo(2), steps: 5500, breaks: ['11:45'] },
        { date: this.yesterday, steps: 7800, breaks: ['10:15', '14:15'] },
        { date: this.today, steps: 2500, breaks: ['11:00'] }, // Przykładowa przerwa dziś
      ];
      this.saveDataToLocalStorage(loadedData); // Zapisujemy nowo wygenerowane dane
    }
    
    this.activityDataSubject = new BehaviorSubject<DailyActivity[]>(loadedData);
    this.dailyActivity$ = this.activityDataSubject.asObservable();

    console.log(`Serwis aktywności gotowy. Dzisiaj: ${this.today}, Wczoraj: ${this.yesterday}`);
  }

  private loadDataFromLocalStorage(): DailyActivity[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        // Upewniamy się, że wczytane dane mają poprawny format
        const parsedData = JSON.parse(data) as DailyActivity[];
        return parsedData.map(item => ({
            ...item,
            breaks: Array.isArray(item.breaks) ? item.breaks : []
        }));
      }
    } catch (e) {
      console.error("Błąd podczas ładowania danych z localStorage", e);
    }
    return [];
  }

  private saveDataToLocalStorage(data: DailyActivity[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      console.log('Dane aktywności zapisane w localStorage.');
    } catch (e) {
      console.error("Błąd podczas zapisywania danych do localStorage", e);
    }
  }

  getHistoricalData(): Observable<DailyActivity[]> {
    // Symulacja pobierania danych z API z opóźnieniem 300ms
    return this.dailyActivity$.pipe(delay(300));
  }

  getLastFiveDaysData(): Observable<DailyActivity[]> {
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    const fiveDaysAgoFormatted = this.getFormattedDate(fiveDaysAgo);
    
    return this.dailyActivity$.pipe(
      map(data => data
        .filter(d => d.date !== this.today)
        .filter(d => d.date >= fiveDaysAgoFormatted)
        .sort((a, b) => a.date.localeCompare(b.date))
      ),
      delay(300)
    );
  }
  
  getPreviousDayData(): Observable<DailyActivity | undefined> {
    return this.dailyActivity$.pipe(
      map(data => data.find(d => d.date === this.yesterday))
    );
  }

  recordBreak(breakTime: string): void {
    const currentData = this.activityDataSubject.getValue();
    
    let todayEntry = currentData.find(d => d.date === this.today);
    
    if (todayEntry) {
      todayEntry.breaks.push(breakTime); 
    } else {
      currentData.push({ date: this.today, steps: 0, breaks: [breakTime] });
    }

    this.saveDataToLocalStorage(currentData);
    this.activityDataSubject.next([...currentData]); 
    console.log(`Zarejestrowano przerwę o ${breakTime}. Aktualny stan dzisiaj (${this.today}):`, todayEntry?.breaks.length);
  }

  updateSteps(newSteps: number): void {
      const currentData = this.activityDataSubject.getValue();
      let todayEntry = currentData.find(d => d.date === this.today);
      
      if (todayEntry) {
        todayEntry.steps = newSteps;
      } else {
         currentData.push({ date: this.today, steps: newSteps, breaks: [] }); 
      }

      this.saveDataToLocalStorage(currentData); 
      this.activityDataSubject.next([...currentData]);
      console.log(`Zaktualizowano kroki dla dnia ${this.today}: ${newSteps}`);
  }
}
