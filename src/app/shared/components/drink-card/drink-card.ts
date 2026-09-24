import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DrinkListItem } from '../../../models/drink.model';
import { drinkImage } from '../../utils/drink-image';

@Component({
  selector: 'app-drink-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <a class="card" [routerLink]="['/drink', drink().id]">
      <span class="stage">
        <img
          class="glass"
          [src]="image()"
          [alt]="drink().name"
          width="350"
          height="350"
          loading="lazy"
        />
      </span>
      <span class="name">{{ drink().name }}</span>
    </a>
  `,
  styleUrl: './drink-card.scss',
})
export class DrinkCard {
  readonly drink = input.required<DrinkListItem>();

  protected readonly image = computed(() => drinkImage(this.drink().thumb, 'medium'));
}
