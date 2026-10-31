# @panneau/app

The Panneau admin panel: the app entry (`createPanneauApp`), the shell with its sidebar, and the pages of resources.

The shell is a first version, for Phase 2 of the [roadmap](../../docs/roadmap.md): a sidebar from the `main` menu of the definition, collapsible to a rail of icons (Ctrl+\\ or ⌘+\\), the page on a raised panel, a drawer on small screens, and the home, list, create, edit and plugin pages, built with `@panneau/lists`, `@panneau/forms` and `@panneau/actions`. The show route opens the item's details in a panel next to its list, with its preview when its resource has one: a component of a plugin (`previews`) or its page on the site in an iframe ([decisions/0028](../../docs/decisions/0028-item-panel.md)). **Go to…** (⌘K or Ctrl+K, or its button in the sidebar) opens a command palette: recent items, navigation, "New {resource}", the `commands` of plugins, the app's actions, and the results of the server's search, grouped by resource; an item opens its form ([decisions/0029](../../docs/decisions/0029-go-to-palette.md)). "Search in" narrows it to one resource, until Backspace in the empty field ([decisions/0030](../../docs/decisions/0030-search-parameters-and-scope.md)). Leaving a form with unsaved changes asks first, by a link or by going back or forward. The tab is named after the page, and focus moves to the title of each new page, for screen readers. While the definition, a list, an item or a preview loads, the app shows a skeleton of its shape, not a spinner ([decisions/0034](../../docs/decisions/0034-skeletons-while-content-loads.md)). The entry contract below is stable: see [decisions/0019](../../docs/decisions/0019-app-entry.md).

Try it with `npm run playground` at the root of the repository: the whole app on the mock backend of `@panneau/protocol` (`?theme=flat` for a flat frame).

```ts
// resources/js/panneau.tsx
import { createPanneauApp } from '@panneau/app';

createPanneauApp({ element: document.getElementById('panneau')!, plugins: [] });
```

The page writes the boot config next to the root element ([protocol.md](../../docs/protocol.md#boot-config)):

```html
<div id="panneau"></div>
<script type="application/json" id="panneau-boot">
    { "protocol": 1, "apiBaseUrl": "/panneau/api", "basePath": "/panneau", "locale": "fr" }
</script>
```

| Export         | Content                                                                                                                                                                                                                            |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@panneau/app` | `createPanneauApp()`, the `<Panneau>` component, `readBootConfig()` and the types of their options, the component tokens of the shell, and the building blocks of pages for plugin pages: `PageLayout`, `PageHeader`, `LinkButton` |

## Setup

```bash
npm install @panneau/app@^5.0.0-alpha.0 react react-dom @tanstack/react-query
npm install --save-dev vite @vitejs/plugin-react
```

- Add `@vitejs/plugin-react` to the Vite config, and the entry to its inputs.
- The entry imports no CSS and no theme: packages import their own styles, and themes come from plugins.
- The messages of plugins (`locales`) are loaded in the locale of the definition before the shell renders.
- The home route renders `pages.home` of the definition, a page of a plugin, or the cards of the resources without it.
- Named icons (`"icon": "users"` in the definition) are Lucide icons, each loaded when shown. Pass `iconLoader` to load fewer, or `null` for none. The bundle has a chunk for every Lucide icon either way. To keep them out, render `<Panneau>` with your own loader instead: it has no default ([decisions/0036](../../docs/decisions/0036-default-icon-loader.md)).

    ```tsx
    import { Users } from 'lucide-react';
    import { createRoot } from 'react-dom/client';

    import { Panneau, readBootConfig } from '@panneau/app';

    const iconLoader = (name: string) => Promise.resolve(name === 'users' ? Users : null);
    createRoot(document.getElementById('panneau')!).render(
        <Panneau config={readBootConfig()} iconLoader={iconLoader} />,
    );
    ```

- Without `adapter`, the app uses the Laravel preset of the REST adapter (`@panneau/data/laravel`) on `apiBaseUrl`.
- `location` fields place points on OpenStreetMap's tiles, without an address search. Pass `maps` for other tiles or a search: `maps: { geocoding: createNominatimSource() }`, from `@panneau/fields`.
- When the API answers `401` (or `419` from Laravel), the app sends the browser to the login URL. Pass `onUnauthorized` to do something else.
- In `panneau` auth mode, the app shows its login page instead, from `auth` of the definition or of the boot config: an email and a password, a token (`auth.token`), and the OAuth providers. The sidebar has a "Log out" button: in `panneau` mode it calls `adapter.logout()` and shows the login page, in `external` mode it goes to `auth.logoutUrl` ([decisions/0037](../../docs/decisions/0037-login-page-token-and-logout.md)).

## Plugin pages

A page of a plugin (`pages` of a plugin, named by `pages` of the definition) lays itself out as the pages of resources with `PageLayout` and `PageHeader`:

```tsx
import { PageHeader, PageLayout } from '@panneau/app';

export function UsagePage() {
    return (
        <PageLayout>
            <PageHeader title="Usage and costs" actions={<ExportButton />} />
            <UsageChart />
        </PageLayout>
    );
}
```

The edit page of an item shows the actions of its resource placed in `form` (by default, every action of the `item` scope), that the item allows, in its header.

## Theming the shell

The frame reads component tokens ([decisions/0024](../../docs/decisions/0024-theme-model.md)), which a theme sets like those of `@panneau/ui` once `@panneau/app` is imported:

| Tokens                   | What they style                                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------------------ |
| `--panneau-shell-*`      | The window's background (`bg`), the inset of the page (`inset`) and its panel (`panel-*`)        |
| `--panneau-item-panel-*` | The widths (normal and widened), background, radius and shadow of the panel of an item's details |
| `--panneau-sidebar-*`    | The width (expanded and collapsed), background and border of the sidebar, its links and its logo |

```ts
import { defineTheme } from '@panneau/ui';

// A flat frame: the sidebar on a surface, and the page flush against it.
export const flatTheme = defineTheme({
    tokens: {
        'panneau-shell-inset': '0',
        'panneau-shell-panel-radius': '0',
        'panneau-sidebar-bg': 'var(--panneau-color-surface)',
        'panneau-sidebar-border': 'var(--panneau-border-width) solid var(--panneau-color-border)',
    },
});
```

The package layout, scripts and API reports are explained in [`docs/packages.md`](../../docs/packages.md).
