import { defineMessage } from '../message';

/**
 * The messages of `@panneau/fields`, with their English text, which is also the default one. French
 * is in `../fr/fields.ts`.
 */
export const fieldsMessages = {
    add: defineMessage({ id: 'panneau.fields.add', defaultMessage: 'Add' }),
    addType: defineMessage<{ type: string }>({
        id: 'panneau.fields.addType',
        defaultMessage: 'Add: {type}',
    }),
    remove: defineMessage({ id: 'panneau.fields.remove', defaultMessage: 'Remove' }),
    removeItem: defineMessage<{ index: number }>({
        id: 'panneau.fields.removeItem',
        defaultMessage: 'Remove item {index}',
    }),
    moveUp: defineMessage<{ index: number }>({
        id: 'panneau.fields.moveUp',
        defaultMessage: 'Move item {index} up',
    }),
    moveDown: defineMessage<{ index: number }>({
        id: 'panneau.fields.moveDown',
        defaultMessage: 'Move item {index} down',
    }),
    item: defineMessage<{ index: number }>({
        id: 'panneau.fields.item',
        defaultMessage: 'Item {index}',
    }),
    noItems: defineMessage({ id: 'panneau.fields.noItems', defaultMessage: 'No items yet.' }),
    characterCount: defineMessage<{ count: number; max: number }>({
        id: 'panneau.fields.characterCount',
        defaultMessage: '{count, number} / {max, number} characters',
    }),
    openLink: defineMessage({ id: 'panneau.fields.openLink', defaultMessage: 'Open the link' }),
    pickColor: defineMessage({ id: 'panneau.fields.pickColor', defaultMessage: 'Pick a color' }),
    generateSlug: defineMessage<{ field: string }>({
        id: 'panneau.fields.generateSlug',
        defaultMessage: 'Generate from {field}',
    }),
    slugTaken: defineMessage({
        id: 'panneau.fields.slugTaken',
        defaultMessage: 'This slug is already used.',
    }),
    useSuggestion: defineMessage<{ suggestion: string }>({
        id: 'panneau.fields.useSuggestion',
        defaultMessage: 'Use {suggestion}',
    }),
    search: defineMessage({ id: 'panneau.fields.search', defaultMessage: 'Search…' }),
    noRelation: defineMessage({ id: 'panneau.fields.noRelation', defaultMessage: 'None' }),
    noResults: defineMessage({ id: 'panneau.fields.noResults', defaultMessage: 'No results' }),
    createRelation: defineMessage<{ text: string }>({
        id: 'panneau.fields.createRelation',
        defaultMessage: 'Create “{text}”',
    }),
    createRelationFailed: defineMessage<{ text: string }>({
        id: 'panneau.fields.createRelationFailed',
        defaultMessage: '“{text}” couldn’t be created.',
    }),
    relationUnavailable: defineMessage({
        id: 'panneau.fields.relationUnavailable',
        defaultMessage: 'Items can’t be searched here.',
    }),
    chooseFile: defineMessage({ id: 'panneau.fields.chooseFile', defaultMessage: 'Choose a file' }),
    chooseFiles: defineMessage({
        id: 'panneau.fields.chooseFiles',
        defaultMessage: 'Choose files',
    }),
    replaceFile: defineMessage({
        id: 'panneau.fields.replaceFile',
        defaultMessage: 'Replace the file',
    }),
    dropHere: defineMessage({ id: 'panneau.fields.dropHere', defaultMessage: 'or drop them here' }),
    dropZone: defineMessage({ id: 'panneau.fields.dropZone', defaultMessage: 'Drop files here' }),
    noFile: defineMessage({ id: 'panneau.fields.noFile', defaultMessage: 'No file' }),
    removeFile: defineMessage<{ name: string }>({
        id: 'panneau.fields.removeFile',
        defaultMessage: 'Remove {name}',
    }),
    rejectedType: defineMessage<{ name: string }>({
        id: 'panneau.fields.rejectedType',
        defaultMessage: '{name}: this type of file is not accepted.',
    }),
    rejectedSize: defineMessage<{ name: string; size: string }>({
        id: 'panneau.fields.rejectedSize',
        defaultMessage: '{name}: files can’t be larger than {size}.',
    }),
    uploads: defineMessage({ id: 'panneau.fields.uploads', defaultMessage: 'Uploads' }),
    uploading: defineMessage({ id: 'panneau.fields.uploading', defaultMessage: 'Uploading' }),
    uploadCompleting: defineMessage({
        id: 'panneau.fields.uploadCompleting',
        defaultMessage: 'Finishing',
    }),
    uploadPaused: defineMessage({ id: 'panneau.fields.uploadPaused', defaultMessage: 'Paused' }),
    uploadFailed: defineMessage<{ error: string }>({
        id: 'panneau.fields.uploadFailed',
        defaultMessage: 'Failed: {error}',
    }),
    pauseUpload: defineMessage<{ name: string }>({
        id: 'panneau.fields.pauseUpload',
        defaultMessage: 'Pause {name}',
    }),
    resumeUpload: defineMessage<{ name: string }>({
        id: 'panneau.fields.resumeUpload',
        defaultMessage: 'Resume {name}',
    }),
    cancelUpload: defineMessage<{ name: string }>({
        id: 'panneau.fields.cancelUpload',
        defaultMessage: 'Cancel {name}',
    }),
    retryUpload: defineMessage<{ name: string }>({
        id: 'panneau.fields.retryUpload',
        defaultMessage: 'Retry {name}',
    }),
    missingPlugin: defineMessage<{ type: string }>({
        id: 'panneau.fields.missingPlugin',
        defaultMessage: 'This field needs a plugin for the “{type}” type.',
    }),
};
