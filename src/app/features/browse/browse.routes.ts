import { ResolveFn, Route } from '@angular/router';
import { BrowseConfig } from './browse-config';

const loadBrowse = () => import('./browse').then((m) => m.Browse);

const selectedTitle: ResolveFn<string> = (route) => `${route.paramMap.get('name')} | Cocktails`;

/** Crea le rotte `/<path>` e `/<path>/:name` per una sezione di esplorazione. */
export function browseRoutes(config: BrowseConfig): Route[] {
  const path = config.basePath.replace(/^\//, '');
  return [
    {
      path,
      title: `${config.title} | Cocktails`,
      data: { browse: config },
      loadComponent: loadBrowse,
    },
    {
      path: `${path}/:name`,
      title: selectedTitle,
      data: { browse: config },
      loadComponent: loadBrowse,
    },
  ];
}
