import { Routes } from '@angular/router';
import { CATEGORY_BROWSE, GLASS_BROWSE } from './features/browse/browse-config';
import { browseRoutes } from './features/browse/browse.routes';

export const routes: Routes = [
  {
    path: '',
    title: 'Cocktails',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },
  {
    path: 'search',
    title: 'Cerca | Cocktails',
    loadComponent: () => import('./features/search/search').then((m) => m.Search),
  },
  ...browseRoutes(CATEGORY_BROWSE),
  ...browseRoutes(GLASS_BROWSE),
  {
    path: '**',
    title: 'Pagina non trovata | Cocktails',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
  },
];
