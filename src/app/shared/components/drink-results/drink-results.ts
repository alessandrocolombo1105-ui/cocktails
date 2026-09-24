import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DrinkListItem } from '../../../models/drink.model';
import { RequestState } from '../../utils/request-state';
import { DrinkGrid } from '../drink-grid/drink-grid';
import { EmptyState } from '../empty-state/empty-state';
import { ErrorState } from '../error-state/error-state';
import { LoadingState } from '../loading-state/loading-state';

/** Mostra una lista di drink gestendo gli stati loading / error / empty / success. */
@Component({
  selector: 'app-drink-results',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DrinkGrid, EmptyState, ErrorState, LoadingState],
  template: `
    @let current = state();
    @switch (current.status) {
      @case ('loading') {
        <app-loading-state message="Sto cercando i cocktail…" />
      }
      @case ('error') {
        <app-error-state [message]="current.error" (retry)="retry.emit()" />
      }
      @case ('success') {
        @if (current.data.length) {
          <app-drink-grid [drinks]="current.data" />
        } @else {
          <app-empty-state [message]="emptyMessage()" />
        }
      }
    }
  `,
})
export class DrinkResults {
  readonly state = input.required<RequestState<DrinkListItem[]>>();
  readonly emptyMessage = input<string>();
  readonly retry = output<void>();
}
