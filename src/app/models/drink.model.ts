/** Elemento restituito dagli endpoint di filtro (`/filter.php`). */
export interface DrinkSummary {
  idDrink: string;
  strDrink: string;
  strDrinkThumb: string;
}

/** Numeri 1..15 usati dai campi `strIngredientN` / `strMeasureN`. */
type IngredientIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;

type IngredientFields = {
  [K in IngredientIndex as `strIngredient${K}`]: string | null;
} & {
  [K in IngredientIndex as `strMeasure${K}`]: string | null;
};

/** Drink completo così come restituito da `/lookup.php` e `/search.php`. */
export type ApiDrink = DrinkSummary &
  IngredientFields & {
    strCategory: string | null;
    strGlass: string | null;
    strAlcoholic: string | null;
    strInstructions: string | null;
    strInstructionsIT: string | null;
  };

export interface DrinkIngredient {
  name: string;
  measure: string | null;
}

/** Drink normalizzato usato dalla UI. */
export interface Drink {
  id: string;
  name: string;
  thumb: string;
  category: string | null;
  glass: string | null;
  alcoholic: string | null;
  instructions: string | null;
  ingredients: DrinkIngredient[];
}

export const MAX_INGREDIENTS = 15;
