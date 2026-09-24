import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="state" role="status" aria-live="polite">
      <span class="spinner" aria-hidden="true"></span>
      <p>{{ message() }}</p>
    </div>
  `,
  styleUrl: '../state.scss',
})
export class LoadingState {
  readonly message = input('Caricamento in corso…');
}
