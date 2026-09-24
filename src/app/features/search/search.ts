import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, debounceTime, distinctUntilChanged, of, startWith, Subject, switchMap } from 'rxjs';
import { CocktailApiService } from '../../core/services/cocktail-api.service';
import { DrinkResults } from '../../shared/components/drink-results/drink-results';
import { toRequestState } from '../../shared/utils/request-state';

const SEARCH_DEBOUNCE_MS = 350;

@Component({
  selector: 'app-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DrinkResults],
  template: `
    <h1>Cerca un cocktail</h1>

    <form class="search" role="search" (submit)="$event.preventDefault(); submit()">
      <label for="search-input" class="visually-hidden">Nome del cocktail</label>
      <input
        id="search-input"
        type="search"
        placeholder="Es. Margarita, Mojito, Negroni…"
        autocomplete="off"
        [value]="term()"
        (input)="onInput($any($event.target).value)"
      />
      <button type="submit" class="button">Cerca</button>
    </form>

    @if (state(); as current) {
      <app-drink-results
        [state]="current"
        [emptyMessage]="'Nessun cocktail corrisponde a “' + query() + '”. Prova un altro nome.'"
        (retry)="retry$.next()"
      />
    } @else {
      <p class="hint">Digita il nome di un cocktail per iniziare la ricerca.</p>
    }
  `,
  styleUrl: './search.scss',
})
export class Search {
  private readonly api = inject(CocktailApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /** Query param `?q=` legato tramite `withComponentInputBinding`. */
  readonly q = input<string>();

  protected readonly query = computed(() => (this.q() ?? '').trim());
  /** Testo nel campo: segue l'URL (es. back del browser) ma è modificabile localmente. */
  protected readonly term = linkedSignal(() => this.q() ?? '');

  protected readonly retry$ = new Subject<void>();
  private readonly input$ = new Subject<string>();

  protected readonly state = toSignal(
    combineLatest([toObservable(this.query), this.retry$.pipe(startWith(undefined))]).pipe(
      switchMap(([query]) =>
        query ? this.api.searchByName(query).pipe(toRequestState()) : of(null),
      ),
    ),
    { initialValue: null },
  );

  constructor() {
    this.input$
      .pipe(debounceTime(SEARCH_DEBOUNCE_MS), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((value) => this.updateUrl(value));
  }

  protected onInput(value: string): void {
    this.term.set(value);
    this.input$.next(value);
  }

  protected submit(): void {
    this.updateUrl(this.term());
  }

  private updateUrl(value: string): void {
    const q = value.trim();
    if (q === this.query()) return;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: q || null },
      replaceUrl: true,
    });
  }
}
