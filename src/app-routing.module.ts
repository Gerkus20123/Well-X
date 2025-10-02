import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  // Przekierowanie głównego url na Dashboard
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  
  // Lazy Loading dla Modułu Dashboard
  {
    path: 'dashboard',
    loadChildren: () => import('./app/features/dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  
  // Lazy Loading dla Modułu Zdrowia Psychicznego
  {
    path: 'mental',
    loadChildren: () => import('./app/features/mental-health/mental-health.module').then(m => m.MentalHealthModule)
  },
  
  // Lazy Loading dla Modułu Aktywności Fizycznej
  {
    path: 'physical',
    loadChildren: () => import('./app/features/physical-activity/physical-activity.module').then(m => m.PhysicalActivityModule)
  },
  
  // Ścieżka catch-all dla nieznanych adresów
  { path: '**', redirectTo: '/dashboard' } 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }