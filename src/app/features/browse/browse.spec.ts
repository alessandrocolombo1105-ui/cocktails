import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { CocktailApiService } from '../../core/services/cocktail-api.service';
import { Browse } from './browse';
import { CATEGORY_BROWSE } from './browse-config';
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
