import { ingredientImage } from './ingredient-image';

describe('ingredientImage', () => {
  const base = 'https://www.thecocktaildb.com/images/ingredients';

  it('builds the small image url by default', () => {
    expect(ingredientImage('Gin')).toBe(`${base}/Gin-Small.png`);
  });

  it('encodes names with spaces', () => {
    expect(ingredientImage('Light rum', 'medium')).toBe(`${base}/Light%20rum-Medium.png`);
  });

  it('returns the original size without suffix', () => {
    expect(ingredientImage('7-Up', 'original')).toBe(`${base}/7-Up.png`);
  });
});
