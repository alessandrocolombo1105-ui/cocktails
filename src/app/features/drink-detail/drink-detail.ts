import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Location } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { combineLatest, of, startWith, Subject, switchMap } from 'rxjs';
import { CocktailApiService } from '../../core/services/cocktail-api.service';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { ErrorState } from '../../shared/components/error-state/error-state';
import { LoadingState } from '../../shared/components/loading-state/loading-state';
import { drinkImage } from '../../shared/utils/drink-image';
import { ingredientImage } from '../../shared/utils/ingredient-image';
import { RequestState, toRequestState } from '../../shared/utils/request-state';
import { Drink } from '../../models/drink.model';

@Component({
  selector: 'app-drink-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, EmptyState, ErrorState, LoadingState],
  template: `
    <button type="button" class="back" (click)="back()">← Indietro</button>

    @let current = state();
    @switch (current.status) {
      @case ('loading') {
        <app-loading-state message="Preparo la ricetta…" />
      }
      @case ('error') {
        <app-error-state [message]="current.error" (retry)="retry$.next()" />
      }
      @case ('success') {
        @if (current.data; as drink) {
          <article class="detail">
            <div class="visual">
              <span class="stage">
                <img
                  class="glass"
                  [src]="image(drink)"
                  [alt]="drink.name"
                  width="700"
                  height="700"
                />
              </span>
            </div>

            <div class="info">
              @if (drink.category) {
                <a class="eyebrow" [routerLink]="['/categories', drink.category]">{{
                  drink.category
                }}</a>
              }
              <h1>{{ drink.name }}</h1>

              <ul class="badges">
                @if (drink.glass) {
                  <li>
                    <a class="badge" [routerLink]="['/glasses', drink.glass]">
                      <span aria-hidden="true">🥃</span> {{ drink.glass }}
                    </a>
                  </li>
                }
                @if (drink.alcoholic) {
                  <li>
                    <span class="badge" [class.badge--soft]="!isAlcoholic(drink)">
                      <span aria-hidden="true">{{ isAlcoholic(drink) ? '🍸' : '🧃' }}</span>
                      {{ alcoholicLabel(drink) }}
                    </span>
                  </li>
                }
              </ul>

              <section>
                <h2>Ingredienti</h2>
                @if (drink.ingredients.length) {
                  <ul class="ingredients">
                    @for (item of drink.ingredients; track $index) {
                      <li>
                        <a class="ingredient" [routerLink]="['/ingredients', item.name]">
                          <img
                            [src]="ingredientImage(item.name)"
                            alt=""
                            width="100"
                            height="100"
                            loading="lazy"
                          />
                          <span class="ingredient-name">{{ item.name }}</span>
                          @if (item.measure) {
                            <span class="measure">{{ item.measure }}</span>
                          }
                        </a>
                      </li>
                    }
                  </ul>
                } @else {
                  <p class="muted">Nessun ingrediente indicato.</p>
                }
              </section>

              <section>
                <h2>Preparazione</h2>
                @if (steps().length) {
                  <ol class="steps">
                    @for (step of steps(); track $index) {
                      <li>{{ step }}</li>
                    }
                  </ol>
                } @else {
                  <p class="muted">Istruzioni non disponibili.</p>
                }
              </section>
            </div>
          </article>
        } @else {
          <app-empty-state
            title="Cocktail non trovato"
            message="Il cocktail che cerchi non esiste o è stato rimosso."
          />
          <p class="center"><a class="button" routerLink="/search">Cerca un cocktail</a></p>
        }
      }
    }
  `,
  styleUrl: './drink-detail.scss',
})
export class DrinkDetail {
  private readonly api = inject(CocktailApiService);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly title = inject(Title);

  /** Parametro di rotta `:id`. */
  readonly id = input.required<string>();

  protected readonly retry$ = new Subject<void>();
  protected readonly ingredientImage = ingredientImage;

  protected readonly state = toSignal(
    combineLatest([toObservable(this.id), this.retry$.pipe(startWith(undefined))]).pipe(
      switchMap(([id]) =>
        /^\d+$/.test(id)
          ? this.api.getDrinkById(id).pipe(toRequestState())
          : of<RequestState<Drink | null>>({ status: 'success', data: null }),
      ),
    ),
    { initialValue: { status: 'loading' } as RequestState<Drink | null> },
  );

  protected readonly steps = computed(() => {
    const current = this.state();
    return current.status === 'success' && current.data
      ? splitSteps(current.data.instructions)
      : [];
  });

  constructor() {
    effect(() => {
      const current = this.state();
      if (current.status === 'success') {
        this.title.setTitle(
          current.data ? `${current.data.name} | Cocktails` : 'Cocktail non trovato | Cocktails',
        );
      }
    });
  }

  protected image(drink: Drink): string {
    return drinkImage(drink.thumb, 'original');
  }

  protected isAlcoholic(drink: Drink): boolean {
    return drink.alcoholic?.toLowerCase() === 'alcoholic';
  }

  protected alcoholicLabel(drink: Drink): string {
    switch (drink.alcoholic?.toLowerCase()) {
      case 'alcoholic':
        return 'Alcolico';
      case 'non alcoholic':
        return 'Analcolico';
      case 'optional alcohol':
        return 'Alcol opzionale';
      default:
        return drink.alcoholic ?? '';
    }
  }

  protected back(): void {
    // Se si è arrivati da un'altra pagina dell'app torna indietro, altrimenti alla home.
    if (this.router.lastSuccessfulNavigation()?.previousNavigation) {
      this.location.back();
    } else {
      this.router.navigate(['/']);
    }
  }
}

/** Divide le istruzioni in passi: per riga se presenti, altrimenti per frase. */
export function splitSteps(instructions: string | null): string[] {
  if (!instructions) return [];
  const lines = instructions.split(/\r?\n/);
  const parts = lines.length > 1 ? lines : instructions.split(/(?<=[.!?])\s+(?=[A-ZÀ-Ý])/);
  return parts.map((p) => p.trim()).filter(Boolean);
}
