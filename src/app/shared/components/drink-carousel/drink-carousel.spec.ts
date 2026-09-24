import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DrinkCarousel } from './drink-carousel';

describe('DrinkCarousel', () => {
  it('renders the title, the slides and the "see all" link', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(DrinkCarousel);
    fixture.componentRef.setInput('title', 'Shot');
    fixture.componentRef.setInput('link', ['/categories', 'Shot']);
    fixture.componentRef.setInput('drinks', [
      { id: '1', name: 'B-52', thumb: 'https://img.test/1.jpg' },
      { id: '2', name: 'Kamikaze', thumb: 'https://img.test/2.jpg' },
    ]);
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h2')!.textContent).toContain('Shot');
    expect(el.querySelectorAll('.slide').length).toBe(2);
    expect(el.querySelector('.see-all')!.getAttribute('href')).toBe('/categories/Shot');
    expect((el.querySelector('[aria-label="Scorri indietro"]') as HTMLButtonElement).disabled).toBe(
      true,
    );
  });
});
