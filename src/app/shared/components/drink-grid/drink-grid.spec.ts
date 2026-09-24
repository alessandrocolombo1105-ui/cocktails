import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DrinkGrid } from './drink-grid';

describe('DrinkGrid', () => {
  it('renders a card per drink linking to its detail page', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(DrinkGrid);
    fixture.componentRef.setInput('drinks', [
      { id: '1', name: 'Mojito', thumb: 'https://img.test/1.jpg' },
      { id: '2', name: 'Negroni', thumb: 'https://img.test/2.jpg' },
    ]);
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    const links = el.querySelectorAll('a');
    expect(links.length).toBe(2);
    expect(links[0].getAttribute('href')).toBe('/drink/1');
    expect(el.querySelector('img')!.getAttribute('src')).toBe('https://img.test/1.jpg/medium');
    expect(el.textContent).toContain('2 cocktail');
  });
});
