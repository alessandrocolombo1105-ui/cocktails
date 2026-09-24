import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, of, startWith, Subject, switchMap } from 'rxjs';
import { CocktailApiService } from '../../core/services/cocktail-api.service';
import { AlphabetBar } from '../../shared/components/alphabet-bar/alphabet-bar';
import { DrinkResults } from '../../shared/components/drink-results/drink-results';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { toRequestState } from '../../shared/utils/request-state';

@Component({
  selector: 'app-alphabet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AlphabetBar, DrinkResults, EmptyState],
  template: `
    <h1>Dalla A alla Z</h1>
    <p class="intro">Sfoglia i cocktail in base alla lettera iniziale del nome.</p>

    <app-alphabet-bar [active]="normalized()" />

    @if (isValid()) {
      <section class="results">
        <header class="results-head">
          <span class="big-letter" aria-hidden="true">{{ normalized().toUpperCase() }}</span>
          <h2>Cocktail che iniziano con “{{ normalized().toUpperCase() }}”</h2>
        </header>
        @if (state(); as current) {
          <app-drink-results
            [state]="current"
            [emptyMessage]="
              'Nessun cocktail inizia con la lettera “' +
              normalized().toUpperCase() +
              '”. Prova un\\'altra lettera.'
            "
            (retry)="retry$.next()"
          />
        }
      </section>
    } @else {
      <app-empty-state
        title="Lettera non valida"
        message="Scegli una lettera dalla barra qui sopra."
      />
    }
  `,
  styleUrl: './alphabet.scss',
})
export class Alphabet {
  private readonly api = inject(CocktailApiService);

  /** Parametro di rotta `:letter`. */
  readonly letter = input<string>();

  protected readonly normalized = computed(() => (this.letter() ?? '').trim().toLowerCase());
  protected readonly isValid = computed(() => /^[a-z]$/.test(this.normalized()));

  protected readonly retry$ = new Subject<void>();

  protected readonly state = toSignal(
    combineLatest([toObservable(this.normalized), this.retry$.pipe(startWith(undefined))]).pipe(
      switchMap(([letter]) =>
        /^[a-z]$/.test(letter)
          ? this.api.searchByFirstLetter(letter).pipe(toRequestState())
          : of(null),
      ),
    ),
    { initialValue: null },
  );
}
