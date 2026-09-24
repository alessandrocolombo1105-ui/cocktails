import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { DrinkListItem } from '../../../models/drink.model';
import { DrinkCard } from '../drink-card/drink-card';

/** Carosello orizzontale a scorrimento con snap e frecce di navigazione. */
@Component({
  selector: 'app-drink-carousel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DrinkCard, RouterLink],
  template: `
    <section class="carousel" [attr.aria-label]="title()">
      <header class="head">
        <h2>{{ title() }}</h2>
        <div class="actions">
          @if (link(); as href) {
            <a class="see-all" [routerLink]="href">Vedi tutti</a>
          }
          <button
            type="button"
            class="arrow"
            aria-label="Scorri indietro"
            [disabled]="atStart()"
            (click)="scroll(-1)"
          >
            ‹
          </button>
          <button
            type="button"
            class="arrow"
            aria-label="Scorri avanti"
            [disabled]="atEnd()"
            (click)="scroll(1)"
          >
            ›
          </button>
        </div>
      </header>

      <ul #track class="track" (scroll)="updateEdges()">
        @for (drink of drinks(); track drink.id) {
          <li class="slide"><app-drink-card [drink]="drink" /></li>
        }
      </ul>
    </section>
  `,
  styleUrl: './drink-carousel.scss',
})
export class DrinkCarousel {
  readonly title = input.required<string>();
  readonly drinks = input.required<DrinkListItem[]>();
  /** Link opzionale alla pagina con tutti i risultati. */
  readonly link = input<string | unknown[]>();

  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');

  protected readonly atStart = signal(true);
  protected readonly atEnd = signal(false);

  constructor() {
    afterRenderEffect(() => {
      this.drinks();
      this.updateEdges();
    });
  }

  protected scroll(direction: 1 | -1): void {
    const el = this.track().nativeElement;
    el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: 'smooth' });
  }

  protected updateEdges(): void {
    const el = this.track().nativeElement;
    this.atStart.set(el.scrollLeft <= 4);
    this.atEnd.set(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }
}
