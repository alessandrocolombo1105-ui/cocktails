import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Cocktails',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },
  {
    path: '**',
    title: 'Pagina non trovata | Cocktails',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
  },
];
