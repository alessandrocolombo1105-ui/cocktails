import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NAV_SECTIONS } from '../../core/navigation';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="header">
      <div class="inner">
        <a class="brand" routerLink="/">Cocktail<span>s</span></a>
        <nav aria-label="Esplora">
          <ul>
            @for (section of sections; track section.path) {
              <li>
                <a
                  [routerLink]="section.path"
                  routerLinkActive="active"
                  ariaCurrentWhenActive="page"
                  >{{ section.label }}</a
                >
              </li>
            }
          </ul>
        </nav>
      </div>
    </header>
  `,
  styleUrl: './header.scss',
})
export class Header {
  protected readonly sections = NAV_SECTIONS;
}
