import { HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, of, OperatorFunction, startWith } from 'rxjs';

export type RequestState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'success'; data: T };

/**
 * Trasforma una chiamata in uno stream di stati: emette subito `loading`,
 * poi `success` con i dati oppure `error` con un messaggio leggibile.
 */
export function toRequestState<T>(): OperatorFunction<T, RequestState<T>> {
  return (source: Observable<T>) =>
    source.pipe(
      map((data): RequestState<T> => ({ status: 'success', data })),
      startWith<RequestState<T>>({ status: 'loading' }),
      catchError((err: unknown) => of<RequestState<T>>({ status: 'error', error: errorMessage(err) })),
    );
}

/** `true` se la richiesta è andata a buon fine ma senza risultati. */
export function isEmptyResult<T>(state: RequestState<T[] | null>): boolean {
  return state.status === 'success' && (!state.data || state.data.length === 0);
}

export function errorMessage(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) {
      return 'Impossibile contattare il server. Controlla la connessione e riprova.';
    }
    return `Il server ha risposto con un errore (${err.status}). Riprova più tardi.`;
  }
  return 'Si è verificato un errore imprevisto. Riprova.';
}
