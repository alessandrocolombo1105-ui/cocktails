import { Observable } from 'rxjs';
import { CocktailApiService } from '../../core/services/cocktail-api.service';
import { DrinkListItem } from '../../models/drink.model';
import { ingredientImage } from '../../shared/utils/ingredient-image';

/** Configurazione di una pagina "lista di valori → cocktail filtrati". */
export interface BrowseConfig {
  title: string;
  intro: string;
  /** Path assoluto della sezione, es. `/categories`. */
  basePath: string;
  loadOptions: (api: CocktailApiService) => Observable<string[]>;
  loadDrinks: (api: CocktailApiService, value: string) => Observable<DrinkListItem[]>;
  resultsTitle: (value: string) => string;
  /** Se presente, i valori sono mostrati come riquadri con immagine. */
  optionImage?: (value: string, size: 'small' | 'medium') => string;
  /** Se presente, mostra un campo per filtrare l'elenco dei valori. */
  filterPlaceholder?: string;
}

export const CATEGORY_BROWSE: BrowseConfig = {
  title: 'Categorie',
  intro: 'Scegli una categoria per vedere i cocktail che ne fanno parte.',
  basePath: '/categories',
  loadOptions: (api) => api.getCategories(),
  loadDrinks: (api, category) => api.filterByCategory(category),
  resultsTitle: (category) => `Categoria: ${category}`,
};

export const GLASS_BROWSE: BrowseConfig = {
  title: 'Bicchieri',
  intro: 'Scegli un bicchiere per scoprire i cocktail che vi si servono.',
  basePath: '/glasses',
  loadOptions: (api) => api.getGlasses(),
  loadDrinks: (api, glass) => api.filterByGlass(glass),
  resultsTitle: (glass) => `Bicchiere: ${glass}`,
};

export const INGREDIENT_BROWSE: BrowseConfig = {
  title: 'Ingredienti',
  intro: 'Parti da quello che hai in casa: scegli un ingrediente e scopri cosa puoi preparare.',
  basePath: '/ingredients',
  loadOptions: (api) => api.getIngredients(),
  loadDrinks: (api, ingredient) => api.filterByIngredient(ingredient),
  resultsTitle: (ingredient) => `Con ${ingredient}`,
  optionImage: (ingredient, size) => ingredientImage(ingredient, size),
  filterPlaceholder: 'Filtra gli ingredienti… (es. rum, lime)',
};
