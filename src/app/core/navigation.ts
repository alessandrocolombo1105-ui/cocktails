export interface NavSection {
  path: string;
  label: string;
  icon: string;
  description: string;
}

/** Modalità di esplorazione mostrate nel menu e nella home. */
export const NAV_SECTIONS: NavSection[] = [
  { path: '/search', label: 'Cerca', icon: '🔍', description: 'Trova un cocktail per nome' },
  {
    path: '/categories',
    label: 'Categorie',
    icon: '🗂️',
    description: 'Cocktail, shot, frullati e altro',
  },
  { path: '/glasses', label: 'Bicchieri', icon: '🥃', description: 'Scegli il bicchiere giusto' },
  {
    path: '/ingredients',
    label: 'Ingredienti',
    icon: '🍋',
    description: 'Parti da quello che hai in casa',
  },
  { path: '/alphabet', label: 'A-Z', icon: '🔤', description: 'Sfoglia per lettera iniziale' },
];
