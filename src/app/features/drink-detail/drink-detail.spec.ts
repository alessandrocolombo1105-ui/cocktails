import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { CocktailApiService } from '../../core/services/cocktail-api.service';
import { Drink } from '../../models/drink.model';
import { DrinkDetail, splitSteps } from './drink-detail';

const MARGARITA: Drink = {
  id: '11007',
  name: 'Margarita',
  thumb: 'https://img.test/margarita.jpg',
  category: 'Ordinary Drink',
  glass: 'Cocktail glass',
  alcoholic: 'Alcoholic',
  instructions: 'Strofina il bordo con il lime.\nShakerare con ghiaccio.',
  ingredients: [
    { name: 'Tequila', measure: '1 1/2 oz' },
    { name: 'Salt', measure: null },
  ],
};

describe('DrinkDetail', () => {
  let getDrinkById: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    getDrinkById = vi.fn(() => of(MARGARITA));
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [{ path: 'drink/:id', component: DrinkDetail }],
          withComponentInputBinding(),
        ),
        { provide: CocktailApiService, useValue: { getDrinkById } },
      ],
    });
  });

  async function navigate(url: string) {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url);
    harness.detectChanges();
    return { harness, el: harness.routeNativeElement as HTMLElement };
  }

  it('renders the full drink card', async () => {
    const { el } = await navigate('/drink/11007');
    expect(getDrinkById).toHaveBeenCalledWith('11007');
    expect(el.querySelector('h1')!.textContent).toContain('Margarita');
    expect(el.querySelector('.glass')!.getAttribute('src')).toBe(MARGARITA.thumb);
    expect(el.querySelector('.eyebrow')!.getAttribute('href')).toBe('/categories/Ordinary%20Drink');
    expect(el.textContent).toContain('Cocktail glass');
    expect(el.textContent).toContain('Alcolico');

    const ingredients = el.querySelectorAll('.ingredient');
    expect(ingredients.length).toBe(2);
    expect(ingredients[0].textContent).toContain('Tequila');
    expect(ingredients[0].textContent).toContain('1 1/2 oz');
    expect(ingredients[1].querySelector('.measure')).toBeNull();
    expect(ingredients[0].getAttribute('href')).toBe('/ingredients/Tequila');

    expect(el.querySelectorAll('.steps li').length).toBe(2);
    expect(TestBed.inject(Title).getTitle()).toBe('Margarita | Cocktails');
  });

  it('shows "not found" when the API has no drink', async () => {
    getDrinkById.mockReturnValueOnce(of(null));
    const { el } = await navigate('/drink/99999999');
    expect(el.textContent).toContain('Cocktail non trovato');
  });

  it('does not call the API for non numeric ids', async () => {
    const { el } = await navigate('/drink/abc');
    expect(getDrinkById).not.toHaveBeenCalled();
    expect(el.textContent).toContain('Cocktail non trovato');
  });

  it('shows an error with retry', async () => {
    getDrinkById.mockReturnValueOnce(throwError(() => new Error('boom')));
    const { el, harness } = await navigate('/drink/11007');
    expect(el.querySelector('app-error-state')).not.toBeNull();

    (el.querySelector('app-error-state button') as HTMLButtonElement).click();
    harness.detectChanges();
    expect(getDrinkById).toHaveBeenCalledTimes(2);
    expect(el.querySelector('h1')!.textContent).toContain('Margarita');
  });
});

describe('splitSteps', () => {
  it('splits by line when available', () => {
    expect(splitSteps('Uno.\n\nDue.')).toEqual(['Uno.', 'Due.']);
  });

  it('splits a single paragraph by sentence', () => {
    expect(splitSteps('Shake well. Pour into a glass. Serve.')).toEqual([
      'Shake well.',
      'Pour into a glass.',
      'Serve.',
    ]);
  });

  it('does not split decimals or abbreviations followed by lowercase', () => {
    expect(splitSteps('Add 1.5 oz of rum. then stir.')).toEqual(['Add 1.5 oz of rum. then stir.']);
  });

  it('handles missing instructions', () => {
    expect(splitSteps(null)).toEqual([]);
  });
});
