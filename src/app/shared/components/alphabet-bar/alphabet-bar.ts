import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');

/** Barra A-Z: ogni lettera è un link a `<basePath>/<lettera>`. */
@Component({
  selector: 'app-alphabet-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <nav class="bar" aria-label="Lettera iniziale">
      <ul>
        @for (letter of letters; track letter) {
          <li>
            <a
              [routerLink]="[basePath(), letter]"
              [class.active]="letter === active()"
              [attr.aria-current]="letter === active() ? 'page' : null"
              [attr.aria-label]="'Lettera ' + letter.toUpperCase()"
              >{{ letter.toUpperCase() }}</a
            >
          </li>
        }
      </ul>
    </nav>
  `,
  styleUrl: './alphabet-bar.scss',
})
export class AlphabetBar {
  /** Lettera selezionata (minuscola). */
  readonly active = input<string>();
  readonly basePath = input('/alphabet');

  protected readonly letters = ALPHABET;
}
