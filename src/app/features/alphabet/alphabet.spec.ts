import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { CocktailApiService } from '../../core/services/cocktail-api.service';
import { ALPHABET_ROUTES } from './alphabet.routes';

describe('Alphabet', () => {
  let searchByFirstLetter: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    searchByFirstLetter = vi.fn(() =>
      of([{ id: '1', name: 'Margarita', thumb: 'https://img.test/1.jpg' }]),
    );
    TestBed.configureTestingModule({
      providers: [
        provideRouter(ALPHABET_ROUTES, withComponentInputBinding()),
        { provide: CocktailApiService, useValue: { searchByFirstLetter } },
      ],
    });
  });

  async function navigate(url: string) {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url);
    harness.detectChanges();
    return { harness, el: harness.routeNativeElement as HTMLElement };
  }

  it('redirects /alphabet to the letter A', async () => {
    const { el } = await navigate('/alphabet');
    expect(searchByFirstLetter).toHaveBeenCalledWith('a');
    expect(el.querySelector('a.active')!.textContent).toBe('A');
  });

  it('renders the 26 letters and the results for the selected one', async () => {
    const { el } = await navigate('/alphabet/M');
    expect(el.querySelectorAll('app-alphabet-bar a').length).toBe(26);
    expect(searchByFirstLetter).toHaveBeenCalledWith('m');
    expect(el.querySelector('h2')!.textContent).toContain('“M”');
    expect(el.querySelectorAll('app-drink-card').length).toBe(1);
  });

  it('shows the empty state for letters without drinks', async () => {
    searchByFirstLetter.mockReturnValueOnce(of([]));
    const { el } = await navigate('/alphabet/u');
    expect(el.textContent).toContain('Nessun cocktail inizia con la lettera “U”');
  });

  it('shows an error with retry', async () => {
    searchByFirstLetter.mockReturnValueOnce(throwError(() => new Error('boom')));
    const { el, harness } = await navigate('/alphabet/b');
    expect(el.querySelector('app-error-state')).not.toBeNull();

    (el.querySelector('app-error-state button') as HTMLButtonElement).click();
    harness.detectChanges();
    expect(searchByFirstLetter).toHaveBeenCalledTimes(2);
    expect(el.querySelectorAll('app-drink-card').length).toBe(1);
  });

  it('rejects invalid letters without calling the API', async () => {
    const { el } = await navigate('/alphabet/ab');
    expect(el.textContent).toContain('Lettera non valida');
    expect(searchByFirstLetter).not.toHaveBeenCalled();
    expect(el.querySelector('app-alphabet-bar')).not.toBeNull();
  });
});
