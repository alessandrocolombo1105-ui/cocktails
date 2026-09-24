const INGREDIENT_IMAGE_BASE = 'https://www.thecocktaildb.com/images/ingredients';

export type IngredientImageSize = 'small' | 'medium' | 'original';

const SUFFIX: Record<IngredientImageSize, string> = {
  small: '-Small',
  medium: '-Medium',
  original: '',
};

/** URL del PNG trasparente di un ingrediente (small 100px, medium 350px). */
export function ingredientImage(name: string, size: IngredientImageSize = 'small'): string {
  return `${INGREDIENT_IMAGE_BASE}/${encodeURIComponent(name.trim())}${SUFFIX[size]}.png`;
}
