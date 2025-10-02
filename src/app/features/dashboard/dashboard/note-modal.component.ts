import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Definicja interfejsu dla notatki
interface Note {
    id: number;
    title: string;
    content: string;
}

@Component({
  selector: 'app-note-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Warstwa Overlaya Modala -->
    <div *ngIf="isOpen" 
         class="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-75 flex items-center justify-center transition-opacity duration-300"
         (click)="isReadOnly ? cancel.emit() : null"> <!-- Kliknięcie poza modalem zamyka tylko w trybie widoku -->

      <!-- Okno Modala -->
      <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6 transform transition-all duration-300 scale-100"
           (click)="$event.stopPropagation()">
        
        <!-- NAGŁÓWEK -->
        <h3 class="text-xl font-bold text-gray-800 border-b pb-3 mb-4">
            {{ isReadOnly ? 'Podgląd Notatki' : (localNote.id ? 'Edytuj Notatkę' : 'Dodaj Nową Notatkę') }}
        </h3>
        <p class="text-sm text-gray-500 mb-4">
            Dla daty: <span class="font-semibold text-red-600">{{ selectedDateForNote }}</span>
        </p>

        <!-- ZAWARTOŚĆ FORMULARZA / WIDOKU -->
        <div class="space-y-4">

            <!-- TYTUŁ -->
            <div>
                <label for="note-title" class="block text-sm font-medium text-gray-700 mb-1">Tytuł</label>
                <ng-container *ngIf="isReadOnly; else titleInput">
                    <p class="text-lg font-semibold p-2 border border-gray-200 rounded-md bg-gray-50 text-gray-800">{{ localNote.title }}</p>
                </ng-container>
                <ng-template #titleInput>
                    <input 
                        id="note-title"
                        type="text"
                        [(ngModel)]="localNote.title"
                        [disabled]="isReadOnly"
                        required
                        class="w-full rounded-lg border border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-3 text-base font-bold"
                    >
                </ng-template>
            </div>

            <!-- TREŚĆ -->
            <div>
                <label for="note-content" class="block text-sm font-medium text-gray-700 mb-1">Treść Notatki</label>
                <ng-container *ngIf="isReadOnly; else contentTextarea">
                    <div class="p-3 border border-gray-300 rounded-lg bg-white h-48 overflow-y-auto whitespace-pre-line text-gray-700">
                        {{ localNote.content }}
                    </div>
                </ng-container>
                <ng-template #contentTextarea>
                    <textarea 
                        id="note-content"
                        [(ngModel)]="localNote.content"
                        [disabled]="isReadOnly"
                        required
                        rows="6"
                        class="w-full rounded-lg border border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-3 text-sm"
                    ></textarea>
                </ng-template>
            </div>
        </div>

        <!-- STOPKA Z PRZYCISKAMI -->
        <div class="flex justify-end gap-3 mt-6">
            
            <!-- PRZYCISK ZAMKNIJ (zawsze widoczny) -->
            <button (click)="cancel.emit()"
                    class="px-4 py-2 text-sm font-medium rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 transition duration-150">
                {{ isReadOnly ? 'Zamknij' : 'Anuluj' }}
            </button>

            <!-- PRZYCISK ZAPISZ (tylko w trybie edycji/tworzenia) -->
            <button *ngIf="!isReadOnly"
                    (click)="save()"
                    [disabled]="!localNote.title || !localNote.content"
                    class="px-4 py-2 text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 disabled:bg-red-300 transition duration-150 shadow-md">
                Zapisz Notatkę
            </button>
        </div>

      </div>
    </div>
  `,
})
export class NoteModalComponent implements OnInit, OnChanges {

    @Input() isOpen: boolean = false;
    @Input() currentNote: Note | null = null;
    @Input() selectedDateForNote: string | null = null;
    @Input() isReadOnly: boolean = false; 
    @Output() saveNote = new EventEmitter<Partial<Note>>();
    @Output() cancelModal = new EventEmitter<void>();

    localNote: Partial<Note> = {};

    constructor() {}

    ngOnInit() {
        this.resetLocalNote();
    }
    
    ngOnChanges(changes: SimpleChanges): void {
        if (changes['isOpen'] && changes['isOpen'].currentValue === true) {
            this.resetLocalNote();
        } else if (changes['currentNote']) {
            this.resetLocalNote();
        }
    }
    
    private resetLocalNote(): void {
        if (this.currentNote) {
            this.localNote = { ...this.currentNote };
        } else {
            this.localNote = { title: '', content: '' };
        }
    }

    save(): void {
        if (this.localNote.title && this.localNote.content) {
            this.saveNote.emit(this.localNote);
        }
    }

    get cancel() {
        return this.cancelModal;
    }
}
