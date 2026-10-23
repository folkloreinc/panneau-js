import { defineMessage } from '../message';

/**
 * The messages of `@panneau/forms`, with their English text, which is also the default one. French
 * is in `../fr/forms.ts`.
 */
export const formsMessages = {
    save: defineMessage({ id: 'panneau.forms.save', defaultMessage: 'Save' }),
    saved: defineMessage({ id: 'panneau.forms.saved', defaultMessage: 'Saved' }),
    unsaved: defineMessage({ id: 'panneau.forms.unsaved', defaultMessage: 'Unsaved changes' }),
    errorCount: defineMessage<{ count: number }>({
        id: 'panneau.forms.errorCount',
        defaultMessage: '{count, plural, one {# error} other {# errors}}',
    }),
    summaryTitle: defineMessage<{ count: number }>({
        id: 'panneau.forms.summaryTitle',
        defaultMessage:
            '{count, plural, one {# error prevents saving} other {# errors prevent saving}}',
    }),
    goToField: defineMessage<{ field: string }>({
        id: 'panneau.forms.goToField',
        defaultMessage: 'Go to {field}',
    }),
    saveFailed: defineMessage({
        id: 'panneau.forms.saveFailed',
        defaultMessage: 'The changes could not be saved.',
    }),
    retry: defineMessage({ id: 'panneau.forms.retry', defaultMessage: 'Try again' }),
    fieldCrashed: defineMessage<{ field: string }>({
        id: 'panneau.forms.fieldCrashed',
        defaultMessage: 'The field “{field}” can’t be displayed.',
    }),
    conflictTitle: defineMessage({
        id: 'panneau.forms.conflictTitle',
        defaultMessage: 'Someone else saved this item',
    }),
    conflictMessage: defineMessage({
        id: 'panneau.forms.conflictMessage',
        defaultMessage:
            'It changed since you opened it. Load the current version, or save yours over it.',
    }),
    conflictChanges: defineMessage({
        id: 'panneau.forms.conflictChanges',
        defaultMessage: 'Values that differ',
    }),
    conflictUnknown: defineMessage({
        id: 'panneau.forms.conflictUnknown',
        defaultMessage: 'The current version wasn’t sent: load it to see what changed.',
    }),
    yours: defineMessage({ id: 'panneau.forms.yours', defaultMessage: 'Yours' }),
    current: defineMessage({ id: 'panneau.forms.current', defaultMessage: 'Current' }),
    empty: defineMessage({ id: 'panneau.forms.empty', defaultMessage: '(empty)' }),
    itemCount: defineMessage<{ count: number }>({
        id: 'panneau.forms.itemCount',
        defaultMessage: '{count, plural, one {# item} other {# items}}',
    }),
    yes: defineMessage({ id: 'panneau.forms.yes', defaultMessage: 'Yes' }),
    no: defineMessage({ id: 'panneau.forms.no', defaultMessage: 'No' }),
    loadCurrent: defineMessage({
        id: 'panneau.forms.loadCurrent',
        defaultMessage: 'Load the current version',
    }),
    overwrite: defineMessage({ id: 'panneau.forms.overwrite', defaultMessage: 'Save mine anyway' }),
    leaveTitle: defineMessage({
        id: 'panneau.forms.leaveTitle',
        defaultMessage: 'Leave without saving?',
    }),
    leaveMessage: defineMessage({
        id: 'panneau.forms.leaveMessage',
        defaultMessage: 'Your changes will be lost.',
    }),
    stay: defineMessage({ id: 'panneau.forms.stay', defaultMessage: 'Stay' }),
    leave: defineMessage({ id: 'panneau.forms.leave', defaultMessage: 'Leave' }),
    rule: {
        required: defineMessage({
            id: 'panneau.forms.rule.required',
            defaultMessage: 'This field is required.',
        }),
        min: defineMessage<{ value: number }>({
            id: 'panneau.forms.rule.min',
            defaultMessage: 'This value must be at least {value, number}.',
        }),
        max: defineMessage<{ value: number }>({
            id: 'panneau.forms.rule.max',
            defaultMessage: 'This value must be at most {value, number}.',
        }),
        minLength: defineMessage<{ value: number }>({
            id: 'panneau.forms.rule.minLength',
            defaultMessage:
                '{value, plural, one {At least # character.} other {At least # characters.}}',
        }),
        maxLength: defineMessage<{ value: number }>({
            id: 'panneau.forms.rule.maxLength',
            defaultMessage:
                '{value, plural, one {At most # character.} other {At most # characters.}}',
        }),
        minItems: defineMessage<{ value: number }>({
            id: 'panneau.forms.rule.minItems',
            defaultMessage: '{value, plural, one {At least # item.} other {At least # items.}}',
        }),
        maxItems: defineMessage<{ value: number }>({
            id: 'panneau.forms.rule.maxItems',
            defaultMessage: '{value, plural, one {At most # item.} other {At most # items.}}',
        }),
        pattern: defineMessage({
            id: 'panneau.forms.rule.pattern',
            defaultMessage: 'This value has an invalid format.',
        }),
        email: defineMessage({
            id: 'panneau.forms.rule.email',
            defaultMessage: 'This value must be an email address.',
        }),
        url: defineMessage({
            id: 'panneau.forms.rule.url',
            defaultMessage: 'This value must be a URL.',
        }),
        json: defineMessage({
            id: 'panneau.forms.rule.json',
            defaultMessage: 'This value must be valid JSON: an object or an array.',
        }),
        in: defineMessage({
            id: 'panneau.forms.rule.in',
            defaultMessage: 'This value is not one of the choices.',
        }),
        accept: defineMessage({
            id: 'panneau.forms.rule.accept',
            defaultMessage: 'This file type is not accepted.',
        }),
        maxSize: defineMessage({
            id: 'panneau.forms.rule.maxSize',
            defaultMessage: 'This file is too large.',
        }),
        before: defineMessage({
            id: 'panneau.forms.rule.before',
            defaultMessage: 'This date is too late.',
        }),
        after: defineMessage({
            id: 'panneau.forms.rule.after',
            defaultMessage: 'This date is too early.',
        }),
        crop: defineMessage({
            id: 'panneau.forms.rule.crop',
            defaultMessage: 'Crop the image for this use.',
        }),
        cropRatios: defineMessage<{ ratios: string }>({
            id: 'panneau.forms.rule.cropRatios',
            defaultMessage: 'Crop the image to {ratios}.',
        }),
        invalid: defineMessage({
            id: 'panneau.forms.rule.invalid',
            defaultMessage: 'This value is invalid.',
        }),
    },
};
