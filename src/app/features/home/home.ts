import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NAV_SECTIONS } from '../../core/navigation';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section class="hero">
      <h1>Scopri il tuo prossimo cocktail</h1>
      <p>Esplora centinaia di ricette per nome, categoria, bicchiere, ingrediente o lettera.</p>
    </section>

    <ul class="modes">
      @for (section of sections; track section.path) {
        <li>
          <a class="mode" [routerLink]="section.path">
            <span class="icon" aria-hidden="true">{{ section.icon }}</span>
            <span class="label">{{ section.label }}</span>
            <span class="description">{{ section.description }}</span>
          </a>
        </li>
      }
    </ul>
  `,
  styleUrl: './home.scss',
})
export class Home {
  protected readonly sections = NAV_SECTIONS;
}
