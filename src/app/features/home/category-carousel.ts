import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, map, startWith, Subject, switchMap } from 'rxjs';
import { CocktailApiService } from '../../core/services/cocktail-api.service';
import { DrinkListItem } from '../../models/drink.model';
import { DrinkCarousel } from '../../shared/components/drink-carousel/drink-carousel';
import { toRequestState } from '../../shared/utils/request-state';

const MAX_SLIDES = 16;

/** Carosello dei cocktail di una categoria, con scheletro di caricamento. */
@Component({
  selector: 'app-category-carousel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DrinkCarousel],
  template: `
    @let current = state();
    @switch (current.status) {
      @case ('loading') {
        <div class="skeleton" aria-hidden="true">
          <span class="title"></span>
          <div class="row">
            @for (i of placeholders; track i) {
              <span class="circle"></span>
            }
          </div>
        </div>
      }
      @case ('error') {
        <div class="error">
          <h2>{{ title() }}</h2>
          <p>
            Impossibile caricare questa sezione.
            <button type="button" class="retry" (click)="retry$.next()">Riprova</button>
          </p>
        </div>
      }
      @case ('success') {
        @if (current.data.length) {
          <app-drink-carousel
            [title]="title()"
            [drinks]="current.data"
            [link]="['/categories', category()]"
          />
        }
      }
    }
  `,
  styleUrl: './category-carousel.scss',
})
export class CategoryCarousel {
  private readonly api = inject(CocktailApiService);

  readonly category = input.required<string>();
  readonly title = input.required<string>();

  protected readonly placeholders = [1, 2, 3, 4, 5, 6];
  protected readonly retry$ = new Subject<void>();

  protected readonly state = toSignal(
    combineLatest([toObservable(this.category), this.retry$.pipe(startWith(undefined))]).pipe(
      switchMap(([category]) =>
        this.api.filterByCategory(category).pipe(
          map((drinks) => shuffle(drinks).slice(0, MAX_SLIDES)),
          toRequestState(),
        ),
      ),
    ),
    { initialValue: { status: 'loading' } as const },
  );
}

function shuffle(drinks: DrinkListItem[]): DrinkListItem[] {
  const copy = [...drinks];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
