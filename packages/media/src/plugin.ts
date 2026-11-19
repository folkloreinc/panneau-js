import { definePlugin } from '@panneau/core';
import type { FieldEntry } from '@panneau/fields';

import { MediaFieldEntry } from './MediaField';

/**
 * The `media` and `image` field types as a `@panneau/core` plugin. Pass it after `fieldsPlugin`:
 * `createPanneauApp({ plugins: [mediaPlugin] })`. The field makes media through the adapter of
 * `@panneau/data`, and uploads through the upload source of the fields context.
 */
export const mediaPlugin: {
    id: string;
    fields: Readonly<Record<string, FieldEntry>>;
} = definePlugin({
    id: 'panneau.media',
    fields: { media: MediaFieldEntry, image: MediaFieldEntry },
});
