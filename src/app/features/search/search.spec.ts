import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { CocktailApiService } from '../../core/services/cocktail-api.service';
import { Drink } from '../../models/drink.model';
import { Search } from './search';

describe('Search', () => {
  let fixture: ComponentFixture<Search>;
  let searchByName: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    searchByName = vi.fn();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: CocktailApiService, useValue: { searchByName } }],
    });
    fixture = TestBed.createComponent(Search);
  });

  async function render(q?: string) {
    if (q !== undefined) fixture.componentRef.setInput('q', q);
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows a hint and does not call the API without a query', async () => {
    const el = await render();
    expect(el.textContent).toContain('Digita il nome');
    expect(searchByName).not.toHaveBeenCalled();
    const suggestion = el.querySelector('.suggestion')!;
    expect(suggestion.textContent).toContain('Margarita');
    expect(suggestion.getAttribute('href')).toContain('q=Margarita');
  });

  it('shows the loading state while fetching', async () => {
    searchByName.mockReturnValue(new Subject<Drink[]>());
    const el = await render('mojito');
    expect(el.querySelector('app-loading-state')).not.toBeNull();
  });

  it('renders results for the query', async () => {
    searchByName.mockReturnValue(
      of([{ id: '1', name: 'Mojito', thumb: 'https://img.test/1.jpg' } as Drink]),
    );
    const el = await render('mojito');
    expect(searchByName).toHaveBeenCalledWith('mojito');
    expect(el.querySelectorAll('app-drink-card').length).toBe(1);
    expect((el.querySelector('input') as HTMLInputElement).value).toBe('mojito');
  });

  it('shows the empty state when nothing matches', async () => {
    searchByName.mockReturnValue(of([]));
    const el = await render('zzz');
    expect(el.textContent).toContain('Nessun cocktail corrisponde a “zzz”');
  });

  it('shows the error state and retries', async () => {
    searchByName.mockReturnValueOnce(throwError(() => new Error('boom')));
    const el = await render('mojito');
    expect(el.querySelector('app-error-state')).not.toBeNull();

    searchByName.mockReturnValueOnce(of([]));
    (el.querySelector('app-error-state button') as HTMLButtonElement).click();
    await render();
    expect(searchByName).toHaveBeenCalledTimes(2);
    expect(el.querySelector('app-empty-state')).not.toBeNull();
  });
});
