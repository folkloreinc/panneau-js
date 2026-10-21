import { defineMessage } from '../message';

/**
 * The messages of `@panneau/media`, with their English text, which is also the default one.
 * French is in `../fr/media.ts`.
 */
export const mediaMessages = {
    chooseFile: defineMessage({ id: 'panneau.media.chooseFile', defaultMessage: 'Choose a file' }),
    chooseFiles: defineMessage({
        id: 'panneau.media.chooseFiles',
        defaultMessage: 'Choose files',
    }),
    replaceFile: defineMessage({
        id: 'panneau.media.replaceFile',
        defaultMessage: 'Replace the file',
    }),
    dropHere: defineMessage({ id: 'panneau.media.dropHere', defaultMessage: 'or drop them here' }),
    dropZone: defineMessage({ id: 'panneau.media.dropZone', defaultMessage: 'Drop files here' }),
    noFile: defineMessage({ id: 'panneau.media.noFile', defaultMessage: 'No file' }),
    noMedia: defineMessage({ id: 'panneau.media.noMedia', defaultMessage: 'No media' }),
    uploads: defineMessage({ id: 'panneau.media.uploads', defaultMessage: 'Uploads' }),
    uploading: defineMessage({ id: 'panneau.media.uploading', defaultMessage: 'Uploading' }),
    completing: defineMessage({ id: 'panneau.media.completing', defaultMessage: 'Finishing' }),
    paused: defineMessage({ id: 'panneau.media.paused', defaultMessage: 'Paused' }),
    failed: defineMessage<{ error: string }>({
        id: 'panneau.media.failed',
        defaultMessage: 'Failed: {error}',
    }),
    pause: defineMessage<{ name: string }>({
        id: 'panneau.media.pause',
        defaultMessage: 'Pause {name}',
    }),
    resume: defineMessage<{ name: string }>({
        id: 'panneau.media.resume',
        defaultMessage: 'Resume {name}',
    }),
    cancel: defineMessage<{ name: string }>({
        id: 'panneau.media.cancel',
        defaultMessage: 'Cancel {name}',
    }),
    retry: defineMessage<{ name: string }>({
        id: 'panneau.media.retry',
        defaultMessage: 'Retry {name}',
    }),
    remove: defineMessage<{ name: string }>({
        id: 'panneau.media.remove',
        defaultMessage: 'Remove {name}',
    }),
    rejectedType: defineMessage<{ name: string }>({
        id: 'panneau.media.rejectedType',
        defaultMessage: '{name}: this type of file is not accepted.',
    }),
    rejectedSize: defineMessage<{ name: string; size: string }>({
        id: 'panneau.media.rejectedSize',
        defaultMessage: '{name}: files can’t be larger than {size}.',
    }),
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
