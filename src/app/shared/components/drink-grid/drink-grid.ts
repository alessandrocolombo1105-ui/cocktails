import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DrinkListItem } from '../../../models/drink.model';
import { DrinkCard } from '../drink-card/drink-card';

@Component({
  selector: 'app-drink-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DrinkCard],
  template: `
    <p class="count">{{ drinks().length }} cocktail</p>
    <ul class="grid">
      @for (drink of drinks(); track drink.id) {
        <li><app-drink-card [drink]="drink" /></li>
      }
    </ul>
  `,
  styles: `
    .count {
      margin: 0 0 1rem;
      color: var(--color-text-muted);
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));
      gap: 1.5rem 1rem;
      margin: 0;
      padding: 0;
      list-style: none;
    }
  `,
})
export class DrinkGrid {
  readonly drinks = input.required<DrinkListItem[]>();
}
