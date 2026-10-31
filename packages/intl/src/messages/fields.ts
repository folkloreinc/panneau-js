import { defineMessage } from '../message';

/**
 * The messages of `@panneau/fields`, with their English text, which is also the default one. French
 * is in `../fr/fields.ts`.
 */
export const fieldsMessages = {
    add: defineMessage({ id: 'panneau.fields.add', defaultMessage: 'Add' }),
    showSecret: defineMessage({ id: 'panneau.fields.showSecret', defaultMessage: 'Show' }),
    hideSecret: defineMessage({ id: 'panneau.fields.hideSecret', defaultMessage: 'Hide' }),
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
    hours: defineMessage({ id: 'panneau.fields.hours', defaultMessage: 'Hours' }),
    minutes: defineMessage({ id: 'panneau.fields.minutes', defaultMessage: 'Minutes' }),
    seconds: defineMessage({ id: 'panneau.fields.seconds', defaultMessage: 'Seconds' }),
    hoursUnit: defineMessage({ id: 'panneau.fields.hoursUnit', defaultMessage: 'h' }),
    minutesUnit: defineMessage({ id: 'panneau.fields.minutesUnit', defaultMessage: 'min' }),
    secondsUnit: defineMessage({ id: 'panneau.fields.secondsUnit', defaultMessage: 's' }),
    searchAddress: defineMessage({
        id: 'panneau.fields.searchAddress',
        defaultMessage: 'Search an address',
    }),
    noPlaces: defineMessage({ id: 'panneau.fields.noPlaces', defaultMessage: 'No places found' }),
    searchAddressHint: defineMessage<{ count: number }>({
        id: 'panneau.fields.searchAddressHint',
        defaultMessage: 'Type at least {count, plural, one {# character} other {# characters}}.',
    }),
    latitude: defineMessage({ id: 'panneau.fields.latitude', defaultMessage: 'Latitude' }),
    longitude: defineMessage({ id: 'panneau.fields.longitude', defaultMessage: 'Longitude' }),
    address: defineMessage({ id: 'panneau.fields.address', defaultMessage: 'Address' }),
    removePoint: defineMessage({
        id: 'panneau.fields.removePoint',
        defaultMessage: 'Remove the point',
    }),
    map: defineMessage<{ label: string }>({
        id: 'panneau.fields.map',
        defaultMessage: 'Map: {label}. Click to place the point, or drag the marker.',
    }),
    embedUrl: defineMessage({ id: 'panneau.fields.embedUrl', defaultMessage: 'URL' }),
    embedLoading: defineMessage({
        id: 'panneau.fields.embedLoading',
        defaultMessage: 'Getting the preview…',
    }),
    embedFailed: defineMessage({
        id: 'panneau.fields.embedFailed',
        defaultMessage: 'This URL can’t be embedded.',
    }),
    jsonInvalid: defineMessage<{ error: string }>({
        id: 'panneau.fields.jsonInvalid',
        defaultMessage: 'This JSON doesn’t parse: {error}',
    }),
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
