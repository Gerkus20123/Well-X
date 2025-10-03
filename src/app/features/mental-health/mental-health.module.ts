import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TimerComponent } from './timer/timer.component';

// Definicja routingu dla modułu
const routes: Routes = [
  { path: '', component: TimerComponent }
];

@NgModule({
  declarations: [
    TimerComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class MentalHealthModule { }