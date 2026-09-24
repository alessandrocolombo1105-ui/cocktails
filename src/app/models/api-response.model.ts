/**
 * Formato di risposta comune delle API TheCocktailDB.
 * `drinks` è `null` quando non ci sono risultati; alcuni endpoint di filtro
 * restituiscono invece la stringa "no data found".
 */
export interface DrinksResponse<T> {
  drinks: T[] | null | string;
}

export interface CategoryItem {
  strCategory: string;
}

export interface GlassItem {
  strGlass: string;
}

export interface IngredientItem {
  strIngredient1: string;
}
