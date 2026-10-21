import { defineMessage } from '../message';

/**
 * The messages of `@panneau/media`, with their English text, which is also the default one.
 * French is in `../fr/media.ts`. Its fields also use those of `@panneau/fields` for uploads.
 */
export const mediaMessages = {
    noMedia: defineMessage({ id: 'panneau.media.noMedia', defaultMessage: 'No media' }),
    statusPending: defineMessage({ id: 'panneau.media.statusPending', defaultMessage: 'Waiting' }),
    statusProcessing: defineMessage({
        id: 'panneau.media.statusProcessing',
        defaultMessage: 'Processing',
    }),
    statusFailed: defineMessage({
        id: 'panneau.media.statusFailed',
        defaultMessage: 'Processing failed',
    }),
    unavailable: defineMessage({
        id: 'panneau.media.unavailable',
        defaultMessage: 'Files can’t be uploaded here.',
    }),
};
