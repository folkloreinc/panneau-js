import { fr } from '@panneau/intl';

import { builtInDisplays } from './displays/displays';
import { builtInLayouts } from './layouts/builtIn';
import type { DisplayEntry, ListLayoutEntry } from './types';

/**
 * The built-in displays and layouts as a `@panneau/core` plugin, with the French messages of every
 * Panneau package (from `@panneau/intl`). Lists use the built-in displays and layouts without it:
 * pass it for the messages, before the plugins that replace a display.
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
    locales: { fr },
};
