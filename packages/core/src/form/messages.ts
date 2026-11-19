import type { RuleFailure } from '@panneau/protocol';

/** `YouTube, Vimeo, or Spotify`, as react-intl lists them in English. */
function orList(items: readonly string[]): string {
    return new Intl.ListFormat('en', { type: 'disjunction' }).format(items);
}

/** A number in English (`1,200`), or a value already formatted (an amount). */
const show = (value: number | string | undefined) =>
    typeof value === 'number' ? value.toLocaleString('en') : String(value);

const plural = (count: number, one: string, other: string) =>
    `${show(count)} ${count === 1 ? one : other}`;

/** What the messages of the rules show: a number, an amount, or names. */
export interface RuleMessageValues {
    value?: number | string;
    ratios?: readonly string[];
    providers?: readonly string[];
}

/**
 * The English messages of the failed rules, by the key of their translation in `@panneau/intl`
 * (`panneau.forms.rule.<key>`). They are the fallback of a form without react-intl: forms
 * translate failures with `useFormatRuleFailure()` of `@panneau/forms`. A test of
 * `@panneau/forms` checks that the keys and the English texts match those of `@panneau/intl`.
 */
export const ruleMessages: Readonly<Record<string, (values: RuleMessageValues) => string>> = {
    required: () => 'This field is required.',
    min: ({ value }) => `This value must be at least ${show(value)}.`,
    max: ({ value }) => `This value must be at most ${show(value)}.`,
    minLength: ({ value }) => `At least ${plural(Number(value), 'character', 'characters')}.`,
    maxLength: ({ value }) => `At most ${plural(Number(value), 'character', 'characters')}.`,
    minItems: ({ value }) => `At least ${plural(Number(value), 'item', 'items')}.`,
    maxItems: ({ value }) => `At most ${plural(Number(value), 'item', 'items')}.`,
    pattern: () => 'This value has an invalid format.',
    email: () => 'This value must be an email address.',
    url: () => 'This value must be a URL.',
    json: () => 'This value must be valid JSON: an object or an array.',
    tel: () => 'This value must be a complete phone number.',
    postalCode: () => 'This value must be a postal code of its country.',
    daterangeStart: () => 'Give the start of this range.',
    daterangeEnd: () => 'Give the end of this range.',
    daterangeOrder: () => 'The end can’t be before the start.',
    money: () => 'This value must be an amount in one of the allowed currencies.',
    minAmount: ({ value }) => `This amount must be at least ${show(value)}.`,
    maxAmount: ({ value }) => `This amount must be at most ${show(value)}.`,
    in: () => 'This value is not one of the choices.',
    accept: () => 'This file type is not accepted.',
    maxSize: () => 'This file is too large.',
    before: () => 'This date is too late.',
    after: () => 'This date is too early.',
    crop: () => 'Crop the image for this use.',
    cropRatios: ({ ratios = [] }) => `Crop the image to ${orList(ratios)}.`,
    providers: ({ providers = [] }) => `This embed must come from ${orList(providers)}.`,
    invalid: () => 'This value is invalid.',
};

const strings = (value: unknown): string[] =>
    Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];

/** The key of the message of a failure, and its values. */
function getRuleMessage(failure: RuleFailure): [string, RuleMessageValues] {
    switch (failure.rule) {
        case 'daterange':
            return [
                failure.value === 'start'
                    ? 'daterangeStart'
                    : failure.value === 'end'
                      ? 'daterangeEnd'
                      : 'daterangeOrder',
                {},
            ];
        case 'crop': {
            const ratios = strings(
                typeof failure.value === 'object' && failure.value !== null
                    ? (failure.value as { ratios?: unknown }).ratios
                    : undefined,
            );
            return ratios.length > 0 ? ['cropRatios', { ratios }] : ['crop', {}];
        }
        case 'providers':
            return ['providers', { providers: strings(failure.value) }];
        default:
            return [
                Object.hasOwn(ruleMessages, failure.rule) ? failure.rule : 'invalid',
                typeof failure.value === 'number' || typeof failure.value === 'string'
                    ? { value: failure.value }
                    : {},
            ];
    }
}

/**
 * The message of a failed rule: the rule's own `message`, or a default English message
 * (`ruleMessages`). Forms take a `formatError` option to translate them.
 */
export function formatRuleFailure(failure: RuleFailure): string {
    if (failure.message !== undefined) {
        return failure.message;
    }
    const [key, values] = getRuleMessage(failure);
    return (ruleMessages[key] ?? ruleMessages.invalid)?.(values) ?? 'This value is invalid.';
}
