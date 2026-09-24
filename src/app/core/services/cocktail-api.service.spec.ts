import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { COCKTAIL_API_BASE_URL } from '../config/api.config';
import { CocktailApiService } from './cocktail-api.service';

const BASE = 'https://api.test';

function apiDrink(overrides: Record<string, string | null> = {}) {
  const drink: Record<string, string | null> = {
    idDrink: '11007',
    strDrink: 'Margarita',
    strDrinkThumb: 'https://img.test/margarita.jpg',
    strCategory: 'Ordinary Drink',
    strGlass: 'Cocktail glass',
    strAlcoholic: 'Alcoholic',
    strInstructions: 'Shake with ice.',
    strInstructionsIT: null,
  };
  for (let i = 1; i <= 15; i++) {
    drink[`strIngredient${i}`] = null;
    drink[`strMeasure${i}`] = null;
  }
  return { ...drink, ...overrides };
}

describe('CocktailApiService', () => {
  let service: CocktailApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: COCKTAIL_API_BASE_URL, useValue: BASE },
      ],
    });
    service = TestBed.inject(CocktailApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('searches by name and normalizes drinks', () => {
    let result: unknown;
    service.searchByName('marg').subscribe((drinks) => (result = drinks));

    http.expectOne(`${BASE}/search.php?s=marg`).flush({
      drinks: [
        apiDrink({
          strIngredient1: 'Tequila',
          strMeasure1: '1 1/2 oz ',
          strIngredient2: 'Salt',
          strMeasure2: '',
          strIngredient3: '',
        }),
      ],
    });

    expect(result).toEqual([
      {
        id: '11007',
        name: 'Margarita',
        thumb: 'https://img.test/margarita.jpg',
        category: 'Ordinary Drink',
        glass: 'Cocktail glass',
        alcoholic: 'Alcoholic',
        instructions: 'Shake with ice.',
        ingredients: [
          { name: 'Tequila', measure: '1 1/2 oz' },
          { name: 'Salt', measure: null },
        ],
      },
    ]);
  });

  it('prefers Italian instructions when available', () => {
    let instructions: string | null | undefined;
    service.getDrinkById('11007').subscribe((drink) => (instructions = drink?.instructions));

    http
      .expectOne(`${BASE}/lookup.php?i=11007`)
      .flush({ drinks: [apiDrink({ strInstructionsIT: 'Shakerare con ghiaccio.' })] });

    expect(instructions).toBe('Shakerare con ghiaccio.');
  });

  it('returns null when a drink is not found', () => {
    let result: unknown = 'unset';
    service.getDrinkById('0').subscribe((drink) => (result = drink));

    http.expectOne(`${BASE}/lookup.php?i=0`).flush({ drinks: null });

    expect(result).toBeNull();
  });

  it('returns an empty array for null or "no data found" responses', () => {
    let byLetter: unknown;
    let byCategory: unknown;
    service.searchByFirstLetter('x').subscribe((drinks) => (byLetter = drinks));
    service.filterByCategory('Nope').subscribe((drinks) => (byCategory = drinks));

    http.expectOne(`${BASE}/search.php?f=x`).flush({ drinks: null });
    http.expectOne(`${BASE}/filter.php?c=Nope`).flush({ drinks: 'no data found' });

    expect(byLetter).toEqual([]);
    expect(byCategory).toEqual([]);
  });

  it('maps filter results to list items', () => {
    let result: unknown;
    service.filterByIngredient('Gin').subscribe((drinks) => (result = drinks));

    http.expectOne(`${BASE}/filter.php?i=Gin`).flush({
      drinks: [{ idDrink: '1', strDrink: 'Gin Fizz', strDrinkThumb: 'https://img.test/1.jpg' }],
    });

    expect(result).toEqual([{ id: '1', name: 'Gin Fizz', thumb: 'https://img.test/1.jpg' }]);
  });

  it('encodes filter values with spaces', () => {
    service.filterByGlass('Highball glass').subscribe();
    const req = http.expectOne((r) => r.url === `${BASE}/filter.php`);
    expect(req.request.params.get('g')).toBe('Highball glass');
    req.flush({ drinks: [] });
  });

  it('returns sorted list values', () => {
    let categories: unknown;
    let glasses: unknown;
    let ingredients: unknown;
    service.getCategories().subscribe((v) => (categories = v));
    service.getGlasses().subscribe((v) => (glasses = v));
    service.getIngredients().subscribe((v) => (ingredients = v));

    http
      .expectOne(`${BASE}/list.php?c=list`)
      .flush({ drinks: [{ strCategory: 'Shot' }, { strCategory: 'Cocktail' }] });
    http
      .expectOne(`${BASE}/list.php?g=list`)
      .flush({ drinks: [{ strGlass: 'Wine Glass' }, { strGlass: 'Beer mug' }] });
    http
      .expectOne(`${BASE}/list.php?i=list`)
      .flush({ drinks: [{ strIngredient1: 'Vodka' }, { strIngredient1: 'Gin' }] });

    expect(categories).toEqual(['Cocktail', 'Shot']);
    expect(glasses).toEqual(['Beer mug', 'Wine Glass']);
    expect(ingredients).toEqual(['Gin', 'Vodka']);
  });

  it('propagates HTTP errors', () => {
    let status: number | undefined;
    service.getCategories().subscribe({ error: (err) => (status = err.status) });

    http
      .expectOne(`${BASE}/list.php?c=list`)
      .flush('boom', { status: 500, statusText: 'Server Error' });

    expect(status).toBe(500);
  });
});
