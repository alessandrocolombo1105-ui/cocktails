import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="footer">
      <p>
        Dati e immagini da
        <a href="https://www.thecocktaildb.com" target="_blank" rel="noopener">TheCocktailDB</a>.
      </p>
      <p class="drink-responsibly">Bevi responsabilmente. 🍹</p>
    </footer>
  `,
  styles: `
    .footer {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 0.5rem 1rem;
      max-width: var(--container-width);
      margin: 0 auto;
      padding: 1.5rem 1rem 2rem;
      border-top: 1px solid var(--color-border);
      color: var(--color-text-muted);
      font-size: 0.875rem;
    }

    p {
      margin: 0;
    }
  `,
})
export class Footer {}
