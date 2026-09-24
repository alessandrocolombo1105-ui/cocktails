import { Observable } from 'rxjs';
import { CocktailApiService } from '../../core/services/cocktail-api.service';
import { DrinkListItem } from '../../models/drink.model';

/** Configurazione di una pagina "lista di valori → cocktail filtrati". */
export interface BrowseConfig {
  title: string;
  intro: string;
  /** Path assoluto della sezione, es. `/categories`. */
  basePath: string;
  loadOptions: (api: CocktailApiService) => Observable<string[]>;
  loadDrinks: (api: CocktailApiService, value: string) => Observable<DrinkListItem[]>;
  resultsTitle: (value: string) => string;
}

export const CATEGORY_BROWSE: BrowseConfig = {
  title: 'Categorie',
  intro: 'Scegli una categoria per vedere i cocktail che ne fanno parte.',
  basePath: '/categories',
  loadOptions: (api) => api.getCategories(),
  loadDrinks: (api, category) => api.filterByCategory(category),
  resultsTitle: (category) => `Categoria: ${category}`,
};
