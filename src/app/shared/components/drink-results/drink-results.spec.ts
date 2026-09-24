import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DrinkListItem } from '../../../models/drink.model';
import { RequestState } from '../../utils/request-state';
import { DrinkResults } from './drink-results';

describe('DrinkResults', () => {
  let fixture: ComponentFixture<DrinkResults>;

  async function render(state: RequestState<DrinkListItem[]>) {
    fixture.componentRef.setInput('state', state);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    fixture = TestBed.createComponent(DrinkResults);
  });

  it('shows the loading state', async () => {
    const el = await render({ status: 'loading' });
    expect(el.querySelector('app-loading-state')).not.toBeNull();
  });

  it('shows the error state and forwards retry', async () => {
    let retried = false;
    fixture.componentInstance.retry.subscribe(() => (retried = true));
    const el = await render({ status: 'error', error: 'Errore di rete' });
    expect(el.textContent).toContain('Errore di rete');
    el.querySelector('button')!.click();
    expect(retried).toBe(true);
  });

  it('shows the empty state with a custom message', async () => {
    fixture.componentRef.setInput('emptyMessage', 'Prova un altro nome.');
    const el = await render({ status: 'success', data: [] });
    expect(el.textContent).toContain('Nessun risultato trovato');
    expect(el.textContent).toContain('Prova un altro nome.');
  });

  it('shows the grid when there are results', async () => {
    const el = await render({
      status: 'success',
      data: [{ id: '1', name: 'Mojito', thumb: 'https://img.test/1.jpg' }],
    });
    expect(el.querySelectorAll('app-drink-card').length).toBe(1);
  });
});
