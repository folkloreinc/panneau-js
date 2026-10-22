import { createPanneauApp } from '@panneau/app';
import { createRestAdapter } from '@panneau/data';
import { createMockBackend } from '@panneau/protocol/mock';

import { createPlaygroundDefinition, createPlaygroundItems } from './definition';
import { PagePreview, articlePreviewUrl } from './previews';
import { flatTheme } from './themes';

// The dev server answers every path with the page. A build can be served from any folder: its base
// path is where the page was first opened.
const basePath = import.meta.env.DEV
    ? '/'
    : (sessionStorage.getItem('panneau-playground-base') ??
      (window.location.pathname.replace(/\/(index\.html)?$/, '') || '/'));
sessionStorage.setItem('panneau-playground-base', basePath);

// `?theme=flat` shows the frame restyled through its tokens.
const theme =
    new URLSearchParams(window.location.search).get('theme') ??
    sessionStorage.getItem('panneau-playground-theme');
if (theme !== null) {
    sessionStorage.setItem('panneau-playground-theme', theme);
}

const definition = {
    ...createPlaygroundDefinition(),
    ...(theme === 'flat' ? { theme: { extends: 'flat' } } : {}),
};
const backend = createMockBackend({
    definition,
    items: createPlaygroundItems(),
    previewUrl: ({ item }) => articlePreviewUrl(item),
});

const element = document.getElementById('panneau');
if (element === null) {
    throw new Error('The page has no #panneau element.');
}

createPanneauApp({
    element,
    plugins: [{ id: 'playground', themes: { flat: flatTheme }, previews: { page: PagePreview } }],
    adapter: createRestAdapter({ baseUrl: definition.api.baseUrl, fetch: backend.fetch }),
    config: { protocol: 1, apiBaseUrl: definition.api.baseUrl, basePath, locale: 'en', definition },
});
