import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false
})
export class AppComponent {
  title = '';
  sidenavOpen = false;

  toggleSidenav(): void {
    this.sidenavOpen = !this.sidenavOpen;
  }

  // Definicja elementów menu dla nawigacji
  menuItems = [
    { label: 'Pulpit', route: '/dashboard', icon: 'home' },
    { label: 'Przerwy i Relaks', route: '/mental', icon: 'self_improvement' },
    { label: 'Aktywność', route: '/physical', icon: 'directions_run' },
  ];
}