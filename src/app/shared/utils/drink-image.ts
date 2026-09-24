export type DrinkImageSize = 'small' | 'medium' | 'original';

/** Restituisce l'URL della thumbnail nella dimensione richiesta (small 200px, medium 350px). */
export function drinkImage(url: string, size: DrinkImageSize = 'medium'): string {
  if (!url || size === 'original') return url;
  return `${url.replace(/\/+$/, '')}/${size}`;
}
