import { InjectionToken } from '@angular/core';

export const COCKTAIL_API_BASE_URL = new InjectionToken<string>('COCKTAIL_API_BASE_URL', {
  providedIn: 'root',
  factory: () => 'https://www.thecocktaildb.com/api/json/v1/1',
});
