import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core'; 
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';

// Komponent Pulpitu (Dashboard)
import { DashboardComponent } from './../../features/dashboard/dashboard/dashboard.component'; 
import { ClockComponent } from '../dashboard/dashboard/clock.component';
import { NoteModalComponent } from '../dashboard/dashboard/note-modal.component';

// Definicja routingu dla modułu
const routes: Routes = [
  { path: '', component: DashboardComponent }
];

@NgModule({
  declarations: [
    DashboardComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    ClockComponent,
    NoteModalComponent,
    
    MatCardModule,
    MatGridListModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule, 
    MatFormFieldModule
  ],

  providers: [
    DatePipe
  ]
  
})
export class DashboardModule { }