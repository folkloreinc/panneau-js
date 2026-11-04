import type { RuleFailure } from '@panneau/protocol';

/** `YouTube, Vimeo or Spotify`. */
function orList(items: readonly string[]): string {
    return items.length > 1
        ? `${items.slice(0, -1).join(', ')} or ${String(items.at(-1))}`
        : (items[0] ?? '');
}

const MESSAGES: Record<string, (failure: RuleFailure) => string> = {
    required: () => 'This field is required.',
    min: (failure) => `This value must be at least ${String(failure.value)}.`,
    max: (failure) => `This value must be at most ${String(failure.value)}.`,
    pattern: () => 'This value has an invalid format.',
    email: () => 'This value must be an email address.',
    url: () => 'This value must be a URL.',
    json: () => 'This value must be valid JSON: an object or an array.',
    tel: () => 'This value must be a complete phone number.',
    in: () => 'This value is not one of the choices.',
    accept: () => 'This file type is not accepted.',
    maxSize: () => 'This file is too large.',
    before: () => 'This date is too late.',
    after: () => 'This date is too early.',
    providers: (failure) =>
        `This embed must come from ${orList(Array.isArray(failure.value) ? failure.value.map(String) : [])}.`,
};

/**
 * The message of a failed rule: the rule's own `message`, or a default English message. Forms
 * take a `formatError` option to translate them.
 */
export function formatRuleFailure(failure: RuleFailure): string {
    return failure.message ?? MESSAGES[failure.rule]?.(failure) ?? 'This value is invalid.';
}
