import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, interval, takeUntil } from 'rxjs';
import { DatePipe, CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { NoteModalComponent } from './note-modal.component';

// Definicja interfejsu dla notatki
interface Note {
  id: number;
  title: string;
  content: string;
}

@Component({
  selector: 'app-clock',
  standalone: true,
  imports: [CommonModule, FormsModule, NoteModalComponent],
  template: `
    <!-- Główny kontener zegara i notatek -->
    <div class="shadow-xl rounded-lg border border-gray-200 relative bg-white p-7 flex flex-col">

      <!-- GÓRNA SEKCJA: Zegar i wybór daty -->
      <div class="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4 border-b pb-3"> 

        <!-- BLOK ZEGARA (Mniejszy) -->
        <div class="text-left order-2 sm:order-1 mt-3 sm:mt-0">
            <div class="text-3xl sm:text-xl font-mono font-extrabold text-gray-800">
             {{ currentTime | date:'HH:mm:ss' }}
            </div>
            <div class="text-sm font-mono text-gray-500">
             {{ currentTime | date:'fullDate' }}
            </div>
        </div>
 
        <!-- BLOK WYBORU DATY (Natywny Input Date) -->
        <div class="w-full sm:w-1/4 order-1 sm:order-2">
            <label for="date-picker" class="block text-xs font-medium text-gray-700 mb-2 sm:text-center">Wybierz Datę Notatki</label>
            <input 
                id="date-picker"
                type="date"
                [ngModel]="selectedDate | date:'yyyy-MM-dd'"
                (ngModelChange)="onDateSelected($event)"
                class="mt-1 mb-1 block w-full rounded-md border-gray-300 shadow-md focus:border-red-500 focus:ring-red-500 text-xs p-1"
            >
        </div>
        
      </div>

      <!-- CENTRALNA SEKCJA: SPIS NOTATEK dla wybranej daty -->
      <div class="flex-grow overflow-y-auto pr-2">
        <div class="flex justify-between items-center mb-3">
            <h2 class="text-lg font-semibold text-gray-800">
                <span class="text-gray-400">{{ selectedDateForNote }}</span>
            </h2>
             <button (click)="openCreateModal()" 
                    [disabled]="!selectedDate"
                    class="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-1 px-3 rounded-lg text-xs shadow-md transition duration-150">
                + Dodaj Notatkę
            </button>
        </div>

        <!-- LISTA NOTATEK -->
        <ng-container *ngIf="currentNotes.length > 0; else noNotes">
            <div class="space-y-3">
                @for (note of currentNotes; track note.id) {
                    <div class="p-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm flex flex-col sm:grid sm:grid-cols-[1fr_auto] gap-x-4 gap-x-4 sm:items-center">

                        <!-- KOLUMNA 1: TYTUŁ - KLIKNIĘCIE OTWIERA W TRYBIE TYLKO DO ODCZYTU -->
                        <p (click)="openViewModal(note)"
                           class="text-base font-bold text-red-800 truncate cursor-pointer hover:text-red-600 transition duration-150">
                            {{ note.title }}
                        </p>
                        
                        <!-- KOLUMNA 2: PRZYCISKI AKCJI -->
                        <div class="flex justify-end gap-3 mt-0 self-start">
                            <!-- Zobacz ZMIENIONO NA EDYTUJ (OTWIERA TRYB EDYCJI) -->
                            <button (click)="openEditModal(note)" class="text-xs font-medium text-blue-600 hover:text-blue-800 transition duration-150">
                                Edytuj
                            </button>
                            <button (click)="deleteNote(note.id)" class="text-xs font-medium text-gray-600 hover:text-gray-800 transition duration-150">
                                Usuń
                            </button>
                        </div>
                        
                    </div>
                }
            </div>
        </ng-container>

        <!-- WIDOK BRAKU NOTATEK -->
        <ng-template #noNotes>
            <div class="text-center p-8 bg-gray-100 border border-dashed border-gray-300 rounded-lg">
                <p class="text-gray-500">Brak notatek dla tej daty. Użyj przycisku "Dodaj Notatkę" powyżej, aby stworzyć pierwszą.</p>
            </div>
        </ng-template>

      </div>
    </div>

    <!-- KOMPONENT MODALA ZEWNĘTRZNEGO - DODANO [isReadOnly] -->
    <app-note-modal
        [isOpen]="isCreating"
        [currentNote]="noteToEdit"
        [selectedDateForNote]="selectedDateForNote"
        [isReadOnly]="isReadOnly"
        (saveNote)="saveNote($event)"
        (cancelModal)="cancelNote()"
    ></app-note-modal>
  `,
})
export class ClockComponent implements OnInit, OnDestroy {
  
  currentTime: Date = new Date();
  private destroy$ = new Subject<void>();
  selectedDate: Date | null = new Date();
  selectedDateForNote: string | null = null;
  selectedDateShort: string | null = null;
  isCreating: boolean = false;
  isReadOnly: boolean = false; 
  noteToEdit: Note | null = null; 
  currentNotes: Note[] = []; 
  notesMap: Map<string, Note[]> = new Map<string, Note[]>();

  constructor(private datePipe: DatePipe) { }

  private saveNotesToLocalStorage(): void {
    try {
        const serializedMap = JSON.stringify(Array.from(this.notesMap.entries()));
        localStorage.setItem('angular_clock_notes', serializedMap);
        console.log('Notatki zapisane w localStorage.');
    } catch (e) {
        console.error('Błąd podczas zapisywania notatek do localStorage', e);
    }
  }

  private loadNotesFromLocalStorage(): void {
    try {
        const serializedMap = localStorage.getItem('angular_clock_notes');
        if (serializedMap) {
            const notesArray = JSON.parse(serializedMap);
            this.notesMap = new Map<string, Note[]>(notesArray);
            console.log('Notatki wczytane z localStorage.');
        }
    } catch (e) {
        console.error('Błąd podczas ładowania notatek z localStorage', e);
        this.notesMap = new Map<string, Note[]>();
    }
  }

  ngOnInit(): void {
    this.loadNotesFromLocalStorage();

    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentTime = new Date();
      });

    this.updateNoteDisplay(new Date());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  // Uaktualnia wyświetlanie notatek po wybraniu daty
  private updateNoteDisplay(date: Date): void {
      this.selectedDateShort = this.datePipe.transform(date, 'yyyy-MM-dd') || '';
      this.selectedDateForNote = this.datePipe.transform(date, 'longDate') || 'wybrana data';

      // Ustawienie listy notatek na wybraną datę (lub pustą tablicę)
      this.currentNotes = this.notesMap.get(this.selectedDateShort) || [];
      
      // Zamykamy modal i resetujemy notatkę edytowaną/stan
      this.isCreating = false;
      this.noteToEdit = null;
      this.isReadOnly = false; // Resetowanie stanu ReadOnly
  }

  // METODA OBSŁUGUJĄCA WYBÓR DATY
  onDateSelected(dateString: string): void { 
    if (dateString) {
        const date = new Date(dateString);
        this.selectedDate = date;
        this.updateNoteDisplay(date);
        console.log(`Data wybrana do notatki: ${this.selectedDateShort}`);
    }
  }

  openCreateModal(): void {
      this.isCreating = true;
      this.isReadOnly = false;
      this.noteToEdit = null; 
  }
  
  openEditModal(note: Note): void {
      this.isCreating = true;
      this.isReadOnly = false;
      this.noteToEdit = note;
  }
  
  openViewModal(note: Note): void {
      this.isCreating = true;
      this.isReadOnly = true;
      this.noteToEdit = note;
  }

  saveNote(data: Partial<Note>): void {
    if (!this.selectedDateShort) return;

    let notes = this.notesMap.get(this.selectedDateShort) || [];
    const noteData = data as { title: string, content: string, id?: number };

    if (noteData.id) {
        // TRYB EDYCJI
        const index = notes.findIndex(n => n.id === noteData.id);
        if (index !== -1) {
            notes[index] = { ...notes[index], title: noteData.title, content: noteData.content };
        }
    } else {
        // TRYB TWORZENIA
        const newNote: Note = {
            id: Date.now(),
            title: noteData.title,
            content: noteData.content
        };
        notes.push(newNote);
    }
    
    this.notesMap.set(this.selectedDateShort, notes);
    
    this.saveNotesToLocalStorage();

    this.updateNoteDisplay(this.selectedDate!);
    this.isCreating = false;
    console.log(`Notatka zapisana/zaktualizowana dla dnia: ${this.selectedDateShort}`);
  }


  cancelNote(): void {
    this.isCreating = false;
    this.noteToEdit = null;
    this.isReadOnly = false;
  }

  deleteNote(noteId: number): void {
      if (!this.selectedDateShort) return;

      let notes = this.notesMap.get(this.selectedDateShort);

      if (notes) {
          const updatedNotes = notes.filter(n => n.id !== noteId);
          
          if (updatedNotes.length === 0) {
              this.notesMap.delete(this.selectedDateShort);
          } else {
              this.notesMap.set(this.selectedDateShort, updatedNotes);
          }
          
          this.saveNotesToLocalStorage();

          this.updateNoteDisplay(this.selectedDate!);
          console.log(`Notatka usunięta: ${noteId} dla dnia: ${this.selectedDateShort}`);
      }
  }
}
