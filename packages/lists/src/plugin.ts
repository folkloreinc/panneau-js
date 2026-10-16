import { fr as fieldsFr } from '@panneau/fields/locales';
import { fr as uiFr } from '@panneau/ui/locales';

import { builtInDisplays } from './displays/displays';
import { builtInLayouts } from './layouts/builtIn';
import { fr } from './locales/fr';
import type { DisplayEntry, ListLayoutEntry } from './types';

/**
 * The built-in displays and layouts as a `@panneau/core` plugin, with the French messages of
 * `@panneau/ui`, `@panneau/fields` and `@panneau/lists`. Lists use the built-in displays and
 * layouts without it: pass it for the messages, before the plugins that replace a display.
 */
export const listsPlugin: {
    id: string;
    displays: Readonly<Record<string, DisplayEntry>>;
    listLayouts: Readonly<Record<string, ListLayoutEntry>>;
    locales: Readonly<Record<string, Record<string, string>>>;
} = {
    id: 'panneau-lists',
    displays: builtInDisplays,
    listLayouts: builtInLayouts,
    locales: { fr: { ...uiFr, ...fieldsFr, ...fr } },
};
