import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
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
        @if (options.data.length) {
          <nav [attr.aria-label]="config.title">
            <ul class="options">
              @for (option of options.data; track option) {
                <li>
                  <a
                    class="chip"
                    [routerLink]="[config.basePath, option]"
                    routerLinkActive="active"
                    ariaCurrentWhenActive="page"
                    >{{ option }}</a
                  >
                </li>
              }
            </ul>
          </nav>
        } @else {
          <app-empty-state message="L'elenco è vuoto." />
        }
      }
    }

    @if (name(); as selected) {
      <section class="results">
        <h2>{{ config.resultsTitle(selected) }}</h2>
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

  protected readonly retryOptions$ = new Subject<void>();
  protected readonly retryDrinks$ = new Subject<void>();

  protected readonly optionsState = toSignal(
    combineLatest([toObservable(this.browse), this.retryOptions$.pipe(startWith(undefined))]).pipe(
      switchMap(([config]) => config.loadOptions(this.api).pipe(toRequestState())),
    ),
    { initialValue: { status: 'loading' } as const },
  );

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
}
