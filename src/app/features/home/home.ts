import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NAV_SECTIONS } from '../../core/navigation';
import { CategoryCarousel } from './category-carousel';
import { FeaturedDrink } from './featured-drink';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CategoryCarousel, FeaturedDrink],
  template: `
    <section class="hero">
      <div class="copy">
        <p class="eyebrow">Il tuo bar tascabile</p>
        <h1>Scopri il tuo prossimo <em>cocktail</em></h1>
        <p class="lead">
          Centinaia di ricette da esplorare per nome, categoria, bicchiere, ingrediente o
          lettera. Scegli, mescola, brinda.
        </p>
        <div class="cta">
          <a class="button" routerLink="/search">Cerca un cocktail</a>
          <a class="button button--ghost" routerLink="/categories">Esplora le categorie</a>
        </div>
      </div>
      <app-featured-drink class="featured" />
    </section>

    <nav class="modes" aria-label="Modalità di esplorazione">
      @for (section of sections; track section.path) {
        <a class="mode" [routerLink]="section.path">
          <span class="icon" aria-hidden="true">{{ section.icon }}</span>
          <span>
            <span class="label">{{ section.label }}</span>
            <span class="description">{{ section.description }}</span>
          </span>
        </a>
      }
    </nav>

    <div class="rows">
      @for (row of rows; track row.category) {
        <app-category-carousel [category]="row.category" [title]="row.title" />
      }
    </div>
  `,
  styleUrl: './home.scss',
})
export class Home {
  protected readonly sections = NAV_SECTIONS;

  protected readonly rows = [
    { category: 'Cocktail', title: 'Grandi classici' },
    { category: 'Ordinary Drink', title: 'Drink di tutti i giorni' },
    { category: 'Shot', title: 'Shot da condividere' },
    { category: 'Coffee / Tea', title: 'Caffè & tè' },
  ];
}
