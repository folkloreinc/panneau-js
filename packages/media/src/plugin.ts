import type { FieldEntry } from '@panneau/fields';

import { FileFieldEntry } from './FileField';
import { MediaFieldEntry } from './MediaField';

/**
 * The `file` and `media` field types as a `@panneau/core` plugin. Pass it after `fieldsPlugin`:
 * `createPanneauApp({ plugins: [mediaPlugin] })`. The fields upload through the adapter of
 * `@panneau/data`, directly to storage when the definition announces it.
 */
export const mediaPlugin: {
    id: string;
    fields: Readonly<Record<string, FieldEntry>>;
} = {
    id: 'panneau-media',
    fields: { file: FileFieldEntry, media: MediaFieldEntry },
};
