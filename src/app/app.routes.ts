import { Routes } from '@angular/router';
import { ALPHABET_ROUTES } from './features/alphabet/alphabet.routes';
import { CATEGORY_BROWSE, GLASS_BROWSE, INGREDIENT_BROWSE } from './features/browse/browse-config';
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
  ...browseRoutes(INGREDIENT_BROWSE),
  ...ALPHABET_ROUTES,
  {
    path: 'drink/:id',
    title: 'Cocktail | Cocktails',
    loadComponent: () =>
      import('./features/drink-detail/drink-detail').then((m) => m.DrinkDetail),
  },
  {
    path: '**',
    title: 'Pagina non trovata | Cocktails',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
  },
];
