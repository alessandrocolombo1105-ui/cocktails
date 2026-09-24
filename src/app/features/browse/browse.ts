import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { combineLatest, of, startWith, Subject, switchMap } from 'rxjs';
import { CocktailApiService } from '../../core/services/cocktail-api.service';
import { DrinkResults } from '../../shared/components/drink-results/drink-results';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { ErrorState } from '../../shared/components/error-state/error-state';
import { LoadingState } from '../../shared/components/loading-state/loading-state';
import { toRequestState } from '../../shared/utils/request-state';
import { BrowseConfig } from './browse-config';

/**
 * Pagina generica di esplorazione: mostra la lista dei valori (categorie,
 * bicchieri, ingredienti) e, se è selezionato un valore, i cocktail filtrati.
 */
@Component({
  selector: 'app-browse',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, DrinkResults, EmptyState, ErrorState, LoadingState],
  template: `
    @let config = browse();
    <h1>{{ config.title }}</h1>
    <p class="intro">{{ config.intro }}</p>

    @let options = optionsState();
    @switch (options.status) {
      @case ('loading') {
        <app-loading-state message="Carico l'elenco…" />
      }
      @case ('error') {
        <app-error-state [message]="options.error" (retry)="retryOptions$.next()" />
      }
      @case ('success') {
        @if (config.filterPlaceholder) {
          <div class="filter">
            <label for="options-filter" class="visually-hidden">{{ config.filterPlaceholder }}</label>
            <input
              id="options-filter"
              type="search"
              autocomplete="off"
              [placeholder]="config.filterPlaceholder"
              [value]="filter()"
              (input)="filter.set($any($event.target).value)"
            />
          </div>
        }

        @if (visibleOptions().length) {
          <nav [attr.aria-label]="config.title">
            <ul
              #optionsList
              class="options"
              [class.options--tiles]="config.optionImage"
              [class.options--strip]="config.optionImage && name()"
            >
              @for (option of visibleOptions(); track option) {
                <li>
                  <a
                    [class]="config.optionImage ? 'tile' : 'chip'"
                    [routerLink]="[config.basePath, option]"
                    routerLinkActive="active"
                    ariaCurrentWhenActive="page"
                  >
                    @if (config.optionImage) {
                      <img
                        [src]="config.optionImage(option, 'small')"
                        alt=""
                        width="100"
                        height="100"
                        loading="lazy"
                      />
                    }
                    <span>{{ option }}</span>
                  </a>
                </li>
              }
            </ul>
          </nav>
        } @else if (options.data.length) {
          <app-empty-state [message]="'Nessuna voce corrisponde a “' + filter() + '”.'" />
        } @else {
          <app-empty-state message="L'elenco è vuoto." />
        }
      }
    }

    @if (name(); as selected) {
      <section class="results">
        <header class="results-head">
          @if (config.optionImage) {
            <img
              class="hero-image"
              [src]="config.optionImage(selected, 'medium')"
              alt=""
              width="350"
              height="350"
            />
          }
          <h2>{{ config.resultsTitle(selected) }}</h2>
        </header>
        @if (config.resultsNote) {
          <p class="note" role="note">ℹ️ {{ config.resultsNote }}</p>
        }
        @if (drinksState(); as drinks) {
          <app-drink-results
            [state]="drinks"
            emptyMessage="Nessun cocktail disponibile per questa selezione."
            (retry)="retryDrinks$.next()"
          />
        }
      </section>
    }
  `,
  styleUrl: './browse.scss',
})
export class Browse {
  private readonly api = inject(CocktailApiService);

  /** Configurazione passata tramite `data` della rotta. */
  readonly browse = input.required<BrowseConfig>();
  /** Parametro di rotta `:name` (valore selezionato). */
  readonly name = input<string>();

  protected readonly filter = signal('');
  protected readonly retryOptions$ = new Subject<void>();
  protected readonly retryDrinks$ = new Subject<void>();

  private readonly optionsList = viewChild<ElementRef<HTMLElement>>('optionsList');

  protected readonly optionsState = toSignal(
    combineLatest([toObservable(this.browse), this.retryOptions$.pipe(startWith(undefined))]).pipe(
      switchMap(([config]) => config.loadOptions(this.api).pipe(toRequestState())),
    ),
    { initialValue: { status: 'loading' } as const },
  );

  protected readonly visibleOptions = computed(() => {
    const state = this.optionsState();
    if (state.status !== 'success') return [];
    const term = this.filter().trim().toLowerCase();
    return term ? state.data.filter((o) => o.toLowerCase().includes(term)) : state.data;
  });

  protected readonly drinksState = toSignal(
    combineLatest([
      toObservable(this.browse),
      toObservable(this.name),
      this.retryDrinks$.pipe(startWith(undefined)),
    ]).pipe(
      switchMap(([config, name]) =>
        name ? config.loadDrinks(this.api, name).pipe(toRequestState()) : of(null),
      ),
    ),
    { initialValue: null },
  );

  constructor() {
    // Nella striscia orizzontale, centra la voce selezionata.
    afterRenderEffect(() => {
      const index = this.visibleOptions().indexOf(this.name() ?? '');
      const list = this.optionsList()?.nativeElement;
      const item = list?.children.item(index) as HTMLElement | null;
      if (!list || index < 0 || !item || list.scrollWidth <= list.clientWidth) return;
      list.scrollLeft = item.offsetLeft - (list.clientWidth - item.offsetWidth) / 2;
    });
  }
}
