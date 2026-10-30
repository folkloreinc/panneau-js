import type { QueryClient } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import type { PanneauPlugin } from '@panneau/core';
import type { DataAdapter } from '@panneau/data';
import type { MapsConfig } from '@panneau/fields';
import type { BootConfig, BootConfigInput } from '@panneau/protocol';
import type { NamedIconLoader } from '@panneau/ui';
import { lucideIconLoader } from '@panneau/ui/named-icons';

import { Panneau, type UnauthorizedContext } from './Panneau';
import { parseBootConfig, readBootConfig } from './boot';

/** Options of `createPanneauApp()`. */
export interface PanneauAppOptions {
    /** The element the app renders in. */
    element: Element;
    /** Plugins: field types, pages, locales, themes… */
    plugins?: readonly PanneauPlugin[];
    /** The data adapter. Defaults to `createLaravelAdapter({ baseUrl: config.apiBaseUrl })`. */
    adapter?: DataAdapter;
    /**
     * The boot config. Defaults to the one the server wrote in the page, in
     * `<script type="application/json" id="panneau-boot">`.
     */
    config?: BootConfigInput;
    /** The TanStack Query client. Defaults to a new one. */
    queryClient?: QueryClient;
    /**
     * Loads the icons that the definition names (`"icon": "users"`). Defaults to every Lucide
     * icon, each one in its own chunk, loaded when shown (`lucideIconLoader`). `null` shows no
     * named icons.
     *
     * The bundle has a chunk per Lucide icon whatever this option is, since this function imports
     * the default. An app that passes its own loader to keep them out renders `<Panneau>` itself
     * (decision 0036).
     */
    iconLoader?: NamedIconLoader | null;
    /**
     * Called once when the API answers that the user isn't authenticated. Defaults to sending the
     * browser to the login URL, when there is one.
     */
    onUnauthorized?: (context: UnauthorizedContext) => void;
    /**
     * The tiles and the address search of the maps of `location` fields: `{ geocoding:
     * createNominatimSource() }`. Defaults to OpenStreetMap's tiles, without an address search.
     */
    maps?: MapsConfig | null;
}

/** A mounted app. */
export interface PanneauApp {
    /** The boot config, validated, with defaults applied. */
    config: BootConfig;
    /** Unmounts the app from its element. */
    unmount(): void;
}

/**
 * Mounts the Panneau admin panel in an element of the page. Throws when the boot config is
 * missing or invalid.
 *
 * ```ts
 * import { createPanneauApp } from '@panneau/app';
 *
 * createPanneauApp({ element: document.getElementById('panneau')!, plugins: [] });
 * ```
 */
export function createPanneauApp({
    element,
    config: input,
    iconLoader = lucideIconLoader,
    ...props
}: PanneauAppOptions): PanneauApp {
    const config =
        input !== undefined ? parseBootConfig(input) : readBootConfig(element.ownerDocument);
    const root = createRoot(element);
    root.render(
        <StrictMode>
            <Panneau {...props} config={config} iconLoader={iconLoader} />
        </StrictMode>,
    );
    return { config, unmount: () => root.unmount() };
}
