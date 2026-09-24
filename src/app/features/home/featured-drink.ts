import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { startWith, Subject, switchMap } from 'rxjs';
import { CocktailApiService } from '../../core/services/cocktail-api.service';
import { drinkImage } from '../../shared/utils/drink-image';
import { toRequestState } from '../../shared/utils/request-state';

/** Cocktail casuale in evidenza, mostrato come un grande bicchiere fluttuante. */
@Component({
  selector: 'app-featured-drink',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    @let current = state();
    <div class="featured" [class.loading]="current.status === 'loading'" aria-live="polite">
      @switch (current.status) {
        @case ('loading') {
          <span class="stage"><span class="glass placeholder"></span></span>
          <span class="visually-hidden">Scelgo un cocktail per te…</span>
        }
        @case ('error') {
          <p class="error">Non riesco a scegliere un cocktail ora.</p>
        }
        @case ('success') {
          @if (current.data; as drink) {
            <a class="stage" [routerLink]="['/drink', drink.id]">
              <img
                class="glass"
                [src]="image()"
                [alt]="drink.name"
                width="350"
                height="350"
              />
            </a>
            <p class="eyebrow">Cocktail del momento</p>
            <a class="name" [routerLink]="['/drink', drink.id]">{{ drink.name }}</a>
            <p class="meta">
              {{ drink.category }}
              @if (drink.alcoholic) {
                · {{ drink.alcoholic }}
              }
            </p>
          }
        }
      }
      <button type="button" class="button button--ghost shuffle" (click)="shuffle$.next()">
        🎲 Un altro
      </button>
    </div>
  `,
  styleUrl: './featured-drink.scss',
})
export class FeaturedDrink {
  private readonly api = inject(CocktailApiService);

  protected readonly shuffle$ = new Subject<void>();

  protected readonly state = toSignal(
    this.shuffle$.pipe(
      startWith(undefined),
      switchMap(() => this.api.getRandomDrink().pipe(toRequestState())),
    ),
    { initialValue: { status: 'loading' } as const },
  );

  protected readonly image = computed(() => {
    const current = this.state();
    return current.status === 'success' && current.data
      ? drinkImage(current.data.thumb, 'original')
      : '';
  });
}
