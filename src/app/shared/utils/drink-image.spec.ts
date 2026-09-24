import { drinkImage } from './drink-image';

describe('drinkImage', () => {
  const url = 'https://www.thecocktaildb.com/images/media/drink/abc.jpg';

  it('appends the requested size', () => {
    expect(drinkImage(url, 'small')).toBe(`${url}/small`);
    expect(drinkImage(url)).toBe(`${url}/medium`);
  });

  it('returns the original url', () => {
    expect(drinkImage(url, 'original')).toBe(url);
  });

  it('handles empty urls', () => {
    expect(drinkImage('', 'small')).toBe('');
  });
});
