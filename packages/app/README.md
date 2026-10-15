# @panneau/app

The Panneau admin panel: the app entry (`createPanneauApp`), and the shell, routes and pages to come.

The shell is a placeholder until Phase 2 of the [roadmap](../../docs/roadmap.md): it loads the definition, lists the resources and follows the client routes. The entry contract below is stable: see [decisions/0019](../../docs/decisions/0019-app-entry.md).

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

| Export         | Content                                                                                            |
| -------------- | -------------------------------------------------------------------------------------------------- |
| `@panneau/app` | `createPanneauApp()`, the `<Panneau>` component, `readBootConfig()` and the types of their options |

## Setup

```bash
npm install @panneau/app@^5.0.0-alpha.0 react react-dom @tanstack/react-query
npm install --save-dev vite @vitejs/plugin-react
```

- Add `@vitejs/plugin-react` to the Vite config, and the entry to its inputs.
- The entry imports no CSS and no theme: packages import their own styles, and themes come from plugins.
- Without `adapter`, the app uses the Laravel preset of the REST adapter (`@panneau/data/laravel`) on `apiBaseUrl`.
- When the API answers `401` (or `419` from Laravel), the app sends the browser to the login URL. Pass `onUnauthorized` to do something else.

The package layout, scripts and API reports are explained in [`docs/packages.md`](../../docs/packages.md).
