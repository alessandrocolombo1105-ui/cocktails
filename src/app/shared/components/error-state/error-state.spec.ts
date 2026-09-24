import { TestBed } from '@angular/core/testing';
import { ErrorState } from './error-state';

describe('ErrorState', () => {
  it('shows the message and emits retry', async () => {
    const fixture = TestBed.createComponent(ErrorState);
    fixture.componentRef.setInput('message', 'Errore di rete');
    await fixture.whenStable();

    let retried = false;
    fixture.componentInstance.retry.subscribe(() => (retried = true));

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Errore di rete');
    el.querySelector('button')!.click();
    expect(retried).toBe(true);
  });
});
