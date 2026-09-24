import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CocktailApiService } from '../../core/services/cocktail-api.service';
import { Home } from './home';

describe('Home', () => {
  function setup(api: Partial<Record<keyof CocktailApiService, unknown>>) {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: CocktailApiService, useValue: api }],
    });
    return TestBed.createComponent(Home);
  }

  it('shows the featured drink and a carousel per category', async () => {
    const fixture = setup({
      getRandomDrink: vi.fn(() =>
        of({ id: '9', name: 'Negroni', thumb: 'https://img.test/9.jpg', category: 'Cocktail' }),
      ),
      filterByCategory: vi.fn(() =>
        of([{ id: '1', name: 'Mojito', thumb: 'https://img.test/1.jpg' }]),
      ),
    });
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('app-featured-drink')!.textContent).toContain('Negroni');
    expect(el.querySelectorAll('app-drink-carousel').length).toBe(4);
    expect(el.querySelectorAll('nav.modes a').length).toBe(5);
  });

  it('degrades gracefully when the API fails', async () => {
    const fixture = setup({
      getRandomDrink: vi.fn(() => throwError(() => new Error('boom'))),
      filterByCategory: vi.fn(() => throwError(() => new Error('boom'))),
    });
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.textContent).toContain('Non riesco a scegliere un cocktail');
    expect(el.querySelectorAll('.retry').length).toBe(4);
  });
});
