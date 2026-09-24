import { ResolveFn, Routes } from '@angular/router';

const letterTitle: ResolveFn<string> = (route) =>
  `Lettera ${(route.paramMap.get('letter') ?? '').toUpperCase()} | Cocktails`;

export const ALPHABET_ROUTES: Routes = [
  { path: 'alphabet', redirectTo: 'alphabet/a', pathMatch: 'full' },
  {
    path: 'alphabet/:letter',
    title: letterTitle,
    loadComponent: () => import('./alphabet').then((m) => m.Alphabet),
  },
];
