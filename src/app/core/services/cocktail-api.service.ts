import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { COCKTAIL_API_BASE_URL } from '../config/api.config';
import {
  CategoryItem,
  DrinksResponse,
  GlassItem,
  IngredientItem,
} from '../../models/api-response.model';
import {
  ApiDrink,
  Drink,
  DrinkIngredient,
  DrinkListItem,
  DrinkSummary,
  IngredientIndex,
  MAX_INGREDIENTS,
} from '../../models/drink.model';

@Injectable({ providedIn: 'root' })
export class CocktailApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(COCKTAIL_API_BASE_URL);

  searchByName(name: string): Observable<Drink[]> {
    return this.get<ApiDrink>('search.php', { s: name }).pipe(map((drinks) => drinks.map(toDrink)));
  }

  searchByFirstLetter(letter: string): Observable<Drink[]> {
    return this.get<ApiDrink>('search.php', { f: letter }).pipe(
      map((drinks) => drinks.map(toDrink)),
    );
  }

  getDrinkById(id: string): Observable<Drink | null> {
    return this.get<ApiDrink>('lookup.php', { i: id }).pipe(
      map((drinks) => (drinks.length ? toDrink(drinks[0]) : null)),
    );
  }

  getRandomDrink(): Observable<Drink | null> {
    return this.get<ApiDrink>('random.php', {}).pipe(
      map((drinks) => (drinks.length ? toDrink(drinks[0]) : null)),
    );
  }

  getCategories(): Observable<string[]> {
    return this.get<CategoryItem>('list.php', { c: 'list' }).pipe(
      map((items) => sortNames(items.map((item) => item.strCategory))),
    );
  }

  getGlasses(): Observable<string[]> {
    return this.get<GlassItem>('list.php', { g: 'list' }).pipe(
      map((items) => sortNames(items.map((item) => item.strGlass))),
    );
  }

  getIngredients(): Observable<string[]> {
    return this.get<IngredientItem>('list.php', { i: 'list' }).pipe(
      map((items) => sortNames(items.map((item) => item.strIngredient1))),
    );
  }

  filterByCategory(category: string): Observable<DrinkListItem[]> {
    return this.filter({ c: category });
  }

  filterByGlass(glass: string): Observable<DrinkListItem[]> {
    return this.filter({ g: glass });
  }

  filterByIngredient(ingredient: string): Observable<DrinkListItem[]> {
    return this.filter({ i: ingredient });
  }

  private filter(params: Record<string, string>): Observable<DrinkListItem[]> {
    return this.get<DrinkSummary>('filter.php', params).pipe(
      map((drinks) => drinks.map(toListItem)),
    );
  }

  /** Esegue la GET e normalizza `drinks` (null / "no data found") in un array. */
  private get<T>(endpoint: string, params: Record<string, string>): Observable<T[]> {
    return this.http
      .get<DrinksResponse<T>>(`${this.baseUrl}/${endpoint}`, {
        params: new HttpParams({ fromObject: params }),
      })
      .pipe(map((response) => (Array.isArray(response?.drinks) ? response.drinks : [])));
  }
}

function toListItem(drink: DrinkSummary): DrinkListItem {
  return { id: drink.idDrink, name: drink.strDrink, thumb: drink.strDrinkThumb };
}

function toDrink(drink: ApiDrink): Drink {
  return {
    ...toListItem(drink),
    category: clean(drink.strCategory),
    glass: clean(drink.strGlass),
    alcoholic: clean(drink.strAlcoholic),
    instructions: clean(drink.strInstructionsIT) ?? clean(drink.strInstructions),
    ingredients: toIngredients(drink),
  };
}

function toIngredients(drink: ApiDrink): DrinkIngredient[] {
  const ingredients: DrinkIngredient[] = [];
  for (let n = 1; n <= MAX_INGREDIENTS; n++) {
    const i = n as IngredientIndex;
    const name = clean(drink[`strIngredient${i}`]);
    if (name) {
      ingredients.push({ name, measure: clean(drink[`strMeasure${i}`]) });
    }
  }
  return ingredients;
}

function clean(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function sortNames(names: string[]): string[] {
  return names
    .map((name) => name?.trim())
    .filter((name): name is string => !!name)
    .sort((a, b) => a.localeCompare(b));
}
