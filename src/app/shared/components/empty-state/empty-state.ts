import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="state" role="status">
      <span class="icon" aria-hidden="true">🍸</span>
      <h2>{{ title() }}</h2>
      @if (message()) {
        <p>{{ message() }}</p>
      }
    </div>
  `,
  styleUrl: '../state.scss',
})
export class EmptyState {
  readonly title = input('Nessun risultato trovato');
  readonly message = input<string>();
}
