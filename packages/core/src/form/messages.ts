import type { RuleFailure } from '@panneau/protocol';

const MESSAGES: Record<string, (failure: RuleFailure) => string> = {
    required: () => 'This field is required.',
    min: (failure) => `This value must be at least ${String(failure.value)}.`,
    max: (failure) => `This value must be at most ${String(failure.value)}.`,
    pattern: () => 'This value has an invalid format.',
    email: () => 'This value must be an email address.',
    url: () => 'This value must be a URL.',
    json: () => 'This value must be valid JSON: an object or an array.',
    tel: () => 'This value must be a complete phone number.',
    daterange: (failure) =>
        failure.value === 'start'
            ? 'Give the start of this range.'
            : failure.value === 'end'
              ? 'Give the end of this range.'
              : 'The end can’t be before the start.',
    money: () => 'This value must be an amount in one of the allowed currencies.',
    in: () => 'This value is not one of the choices.',
    accept: () => 'This file type is not accepted.',
    maxSize: () => 'This file is too large.',
    before: () => 'This date is too late.',
    after: () => 'This date is too early.',
};

/**
 * The message of a failed rule: the rule's own `message`, or a default English message. Forms
 * take a `formatError` option to translate them.
 */
export function formatRuleFailure(failure: RuleFailure): string {
    return failure.message ?? MESSAGES[failure.rule]?.(failure) ?? 'This value is invalid.';
}
