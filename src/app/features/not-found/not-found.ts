import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EmptyState } from '../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EmptyState, RouterLink],
  template: `
    <app-empty-state title="Pagina non trovata" message="La pagina che cerchi non esiste." />
    <p class="back"><a class="button" routerLink="/">Torna alla home</a></p>
  `,
  styles: `
    .back {
      text-align: center;
    }

    a {
      text-decoration: none;
    }
  `,
})
export class NotFound {}
