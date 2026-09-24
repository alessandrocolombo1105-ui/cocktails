import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-error-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="state state--error" role="alert">
      <span class="icon" aria-hidden="true">⚠️</span>
      <h2>Qualcosa è andato storto</h2>
      <p>{{ message() }}</p>
      <button type="button" class="button" (click)="retry.emit()">Riprova</button>
    </div>
  `,
  styleUrl: '../state.scss',
})
export class ErrorState {
  readonly message = input.required<string>();
  readonly retry = output<void>();
}
