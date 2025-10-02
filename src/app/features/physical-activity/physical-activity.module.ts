import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { ActivityDashboardComponent } from './../../features/physical-activity/physical-activity/activity-dashboard/activity-dashboard.component';
import { StepInputComponent } from './../../features/physical-activity/physical-activity/step-input/step-input.component';

// Definicja routingu dla modułu
const routes: Routes = [
  { path: '', component: ActivityDashboardComponent }
];

@NgModule({
  declarations: [
    ActivityDashboardComponent,
    StepInputComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class PhysicalActivityModule { }