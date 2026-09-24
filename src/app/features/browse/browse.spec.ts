import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { CocktailApiService } from '../../core/services/cocktail-api.service';
import { Browse } from './browse';
import { CATEGORY_BROWSE, GLASS_BROWSE, INGREDIENT_BROWSE } from './browse-config';
import { browseRoutes } from './browse.routes';

describe('Browse (categories)', () => {
  let api: { getCategories: ReturnType<typeof vi.fn>; filterByCategory: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    api = {
      getCategories: vi.fn(() => of(['Cocktail', 'Other / Unknown'])),
      filterByCategory: vi.fn(() =>
        of([{ id: '1', name: 'Mojito', thumb: 'https://img.test/1.jpg' }]),
      ),
    };
    TestBed.configureTestingModule({
      providers: [
        provideRouter(browseRoutes(CATEGORY_BROWSE), withComponentInputBinding()),
        { provide: CocktailApiService, useValue: api },
      ],
    });
  });

  async function navigate(url: string) {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url, Browse);
    harness.detectChanges();
    return { harness, el: harness.routeNativeElement as HTMLElement };
  }

  it('lists the categories without loading drinks', async () => {
    const { el } = await navigate('/categories');
    const chips = el.querySelectorAll('a.chip');
    expect(chips.length).toBe(2);
    expect(chips[1].getAttribute('href')).toBe('/categories/Other%20%2F%20Unknown');
    expect(api.filterByCategory).not.toHaveBeenCalled();
  });

  it('loads drinks for the selected category, decoding the route param', async () => {
    const { el } = await navigate('/categories/Other%20%2F%20Unknown');
    expect(api.filterByCategory).toHaveBeenCalledWith('Other / Unknown');
    expect(el.querySelector('h2')!.textContent).toContain('Categoria: Other / Unknown');
    expect(el.querySelector('a.chip.active')!.textContent).toContain('Other / Unknown');
    expect(el.querySelectorAll('app-drink-card').length).toBe(1);
  });

  it('shows an error with retry when the list fails', async () => {
    api.getCategories.mockReturnValueOnce(throwError(() => new Error('boom')));
    const { el, harness } = await navigate('/categories');
    expect(el.querySelector('app-error-state')).not.toBeNull();

    (el.querySelector('app-error-state button') as HTMLButtonElement).click();
    harness.detectChanges();
    expect(api.getCategories).toHaveBeenCalledTimes(2);
    expect(el.querySelectorAll('a.chip').length).toBe(2);
  });

  it('shows the empty state when a category has no drinks', async () => {
    api.filterByCategory.mockReturnValueOnce(of([]));
    const { el } = await navigate('/categories/Cocoa');
    expect(el.textContent).toContain('Nessun cocktail disponibile');
  });
});

describe('Browse (glasses)', () => {
  it('lists glasses and loads drinks for the selected one', async () => {
    const api = {
      getGlasses: vi.fn(() => of(['Highball glass', 'Shot glass'])),
      filterByGlass: vi.fn(() => of([{ id: '2', name: 'B-52', thumb: 'https://img.test/2.jpg' }])),
    };
    TestBed.configureTestingModule({
      providers: [
        provideRouter(browseRoutes(GLASS_BROWSE), withComponentInputBinding()),
        { provide: CocktailApiService, useValue: api },
      ],
    });

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/glasses/Shot%20glass', Browse);
    harness.detectChanges();
    const el = harness.routeNativeElement as HTMLElement;

    expect(el.querySelector('h1')!.textContent).toContain('Bicchieri');
    expect(el.querySelectorAll('a.chip').length).toBe(2);
    expect(api.filterByGlass).toHaveBeenCalledWith('Shot glass');
    expect(el.querySelector('h2')!.textContent).toContain('Bicchiere: Shot glass');
    expect(el.querySelectorAll('app-drink-card').length).toBe(1);
  });
});

describe('Browse (ingredients)', () => {
  let api: { getIngredients: ReturnType<typeof vi.fn>; filterByIngredient: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    api = {
      getIngredients: vi.fn(() => of(['Gin', 'Light rum', 'Lime', 'Vodka'])),
      filterByIngredient: vi.fn(() =>
        of([{ id: '3', name: 'Gimlet', thumb: 'https://img.test/3.jpg' }]),
      ),
    };
    TestBed.configureTestingModule({
      providers: [
        provideRouter(browseRoutes(INGREDIENT_BROWSE), withComponentInputBinding()),
        { provide: CocktailApiService, useValue: api },
      ],
    });
  });

  async function navigate(url: string) {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url, Browse);
    harness.detectChanges();
    return { harness, el: harness.routeNativeElement as HTMLElement };
  }

  it('shows ingredient tiles with transparent images', async () => {
    const { el } = await navigate('/ingredients');
    const tiles = el.querySelectorAll('a.tile');
    expect(tiles.length).toBe(4);
    expect(tiles[1].querySelector('img')!.getAttribute('src')).toBe(
      'https://www.thecocktaildb.com/images/ingredients/Light%20rum-Small.png',
    );
    expect(el.querySelector('.options--strip')).toBeNull();
  });

  it('filters the ingredient list', async () => {
    const { el, harness } = await navigate('/ingredients');
    const input = el.querySelector('#options-filter') as HTMLInputElement;

    input.value = 'RU';
    input.dispatchEvent(new Event('input'));
    harness.detectChanges();
    expect([...el.querySelectorAll('a.tile')].map((t) => t.textContent!.trim())).toEqual([
      'Light rum',
    ]);

    input.value = 'xyz';
    input.dispatchEvent(new Event('input'));
    harness.detectChanges();
    expect(el.textContent).toContain('Nessuna voce corrisponde a “xyz”');
  });

  it('switches to a strip and loads drinks when an ingredient is selected', async () => {
    const { el } = await navigate('/ingredients/Lime');
    expect(el.querySelector('.options--strip')).not.toBeNull();
    expect(api.filterByIngredient).toHaveBeenCalledWith('Lime');
    expect(el.querySelector('h2')!.textContent).toContain('Con Lime');
    expect(el.querySelector('.hero-image')!.getAttribute('src')).toContain('Lime-Medium.png');
    expect(el.querySelectorAll('app-drink-card').length).toBe(1);
  });
});
