import type { QueryClient } from '@tanstack/react-query';
import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { PanneauPlugin } from '@panneau/core';
import type { DataAdapter } from '@panneau/data';
import type { MapsConfig } from '@panneau/fields';
import type { BootConfig, BootConfigInput } from '@panneau/protocol';
import type { NamedIconLoader } from '@panneau/ui';
import { lucideIconLoader } from '@panneau/ui/named-icons';

import { BootScreen, Panneau, type PanneauProps, type UnauthorizedContext } from './Panneau';
import { readBootConfigInput } from './bootInput';

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
    /**
     * The nonce of the page's Content Security Policy, for the styles of themes. Defaults to that
     * of `<meta property="csp-nonce">`.
     */
    nonce?: string;
}

/** A mounted app. */
export interface PanneauApp {
    /**
     * The boot config, once validated, with defaults applied (decision 0095). It rejects when the
     * boot config is invalid, with the invalid paths, while the app shows an error page.
     */
    config: Promise<BootConfig>;
    /** Unmounts the app from its element. */
    unmount(): void;
}

/**
 * Validates a boot config with the schemas of the protocol, which load with Zod on first use, out
 * of the JavaScript the page loads up front (decision 0095).
 */
async function validateLater(input: unknown): Promise<BootConfig> {
    return (await import('./boot')).parseBootConfig(input);
}

/** The locale of a boot config before it is validated, for the skeleton of the shell. */
function readLocale(input: unknown): string | undefined {
    const locale =
        typeof input === 'object' && input !== null && 'locale' in input ? input.locale : undefined;
    return typeof locale === 'string' ? locale : undefined;
}

/** `<Panneau>` once its boot config is validated: the skeleton of the shell until then. */
function BootedPanneau({
    config,
    locale,
    ...props
}: Omit<PanneauProps, 'config'> & { config: Promise<BootConfig>; locale: string | undefined }) {
    const [booted, setBooted] = useState<{ config: BootConfig } | 'failed' | null>(null);
    useEffect(() => {
        let current = true;
        config.then(
            (validated) => {
                if (current) {
                    setBooted({ config: validated });
                }
            },
            () => {
                if (current) {
                    setBooted('failed');
                }
            },
        );
        return () => {
            current = false;
        };
    }, [config]);
    if (booted === null || booted === 'failed') {
        return <BootScreen locale={locale} failed={booted === 'failed'} />;
    }
    return <Panneau {...props} config={booted.config} />;
}

/**
 * Mounts the Panneau admin panel in an element of the page. Throws when the page has no boot
 * config, or when it isn't JSON. The boot config is validated once the schemas of the protocol have
 * loaded (decision 0095): the app shows the skeleton of the shell until then, and an error page
 * when it is invalid, with the invalid paths in the console and in the rejection of `config`.
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
    const raw: unknown = input !== undefined ? input : readBootConfigInput(element.ownerDocument);
    const config = validateLater(raw);
    // Handled here, so that a project that doesn't read `config` gets one error, not two
    config.catch((error: unknown) => {
        console.error(error);
    });
    const root = createRoot(element);
    root.render(
        <StrictMode>
            <BootedPanneau
                {...props}
                config={config}
                locale={readLocale(raw)}
                iconLoader={iconLoader}
            />
        </StrictMode>,
    );
    return { config, unmount: () => root.unmount() };
}
