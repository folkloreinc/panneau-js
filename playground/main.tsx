import { createPanneauApp } from '@panneau/app';
import { createRestAdapter } from '@panneau/data';
import { createMockBackend } from '@panneau/protocol/mock';

import { createPlaygroundDefinition, createPlaygroundItems } from './definition';

// The dev server answers every path with the page. A build can be served from any folder: its base
// path is where the page was first opened.
const basePath = import.meta.env.DEV
    ? '/'
    : (sessionStorage.getItem('panneau-playground-base') ??
      (window.location.pathname.replace(/\/(index\.html)?$/, '') || '/'));
sessionStorage.setItem('panneau-playground-base', basePath);

const definition = createPlaygroundDefinition();
const backend = createMockBackend({ definition, items: createPlaygroundItems() });

const element = document.getElementById('panneau');
if (element === null) {
    throw new Error('The page has no #panneau element.');
}

createPanneauApp({
    element,
    adapter: createRestAdapter({ baseUrl: definition.api.baseUrl, fetch: backend.fetch }),
    config: { protocol: 1, apiBaseUrl: definition.api.baseUrl, basePath, locale: 'en', definition },
});
