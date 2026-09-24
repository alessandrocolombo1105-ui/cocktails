import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { isEmptyResult, RequestState, toRequestState } from './request-state';

function collect<T>(source: import('rxjs').Observable<T>) {
  const states: RequestState<T>[] = [];
  source.pipe(toRequestState()).subscribe((s) => states.push(s));
  return states;
}

describe('toRequestState', () => {
  it('emits loading then success', () => {
    expect(collect(of([1, 2]))).toEqual([
      { status: 'loading' },
      { status: 'success', data: [1, 2] },
    ]);
  });

  it('emits a network error message', () => {
    const states = collect(throwError(() => new HttpErrorResponse({ status: 0 })));
    expect(states[1]).toEqual({ status: 'error', error: expect.stringContaining('connessione') });
  });

  it('emits an HTTP error message with the status code', () => {
    const states = collect(throwError(() => new HttpErrorResponse({ status: 503 })));
    expect(states[1]).toEqual({ status: 'error', error: expect.stringContaining('503') });
  });
});

describe('isEmptyResult', () => {
  it('detects empty successful results', () => {
    expect(isEmptyResult({ status: 'success', data: [] })).toBe(true);
    expect(isEmptyResult({ status: 'success', data: null })).toBe(true);
    expect(isEmptyResult({ status: 'success', data: [1] })).toBe(false);
    expect(isEmptyResult({ status: 'loading' })).toBe(false);
  });
});
