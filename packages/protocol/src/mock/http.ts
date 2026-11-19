// The responses of the mock backend: JSON, problems, and the messages of failed rules.
import type { RuleFailure } from '../rules';
import type { Item, Problem } from '../schemas/api';
import { isRecord } from '../values';
import { PROBLEM_CONTENT_TYPE } from '../version';

export const DEFAULT_MESSAGES: Record<string, (failure: RuleFailure) => string> = {
    required: () => 'This field is required.',
    min: (failure) => `This value must be at least ${String(failure.value)}.`,
    max: (failure) => `This value must be at most ${String(failure.value)}.`,
    pattern: () => 'This value has an invalid format.',
    email: () => 'This value must be an email address.',
    url: () => 'This value must be a URL.',
    json: () => 'This value must be valid JSON: an object or an array.',
    in: () => 'This value is not one of the choices.',
    accept: () => 'This file type is not accepted.',
    maxSize: () => 'This file is too large.',
    before: () => 'This date is too late.',
    after: () => 'This date is too early.',
    providers: (failure) =>
        `This embed must come from ${Array.isArray(failure.value) ? failure.value.join(' or ') : 'another provider'}.`,
    crop: (failure) => {
        const ratios = isRecord(failure.value) ? failure.value.ratios : undefined;
        return Array.isArray(ratios) && ratios.length > 0
            ? `Crop this image to ${ratios.join(' or ')}.`
            : 'Crop this image.';
    },
};

export function message(failure: RuleFailure): string {
    return failure.message ?? DEFAULT_MESSAGES[failure.rule]?.(failure) ?? 'This value is invalid.';
}

export function json(
    status: number,
    body: unknown,
    headers: Record<string, string> = {},
): Response {
    return new Response(status === 204 ? null : JSON.stringify(body), {
        status,
        headers: status === 204 ? headers : { 'Content-Type': 'application/json', ...headers },
    });
}

export function problem(status: number, title: string, extra: Partial<Problem> = {}): Response {
    const body: Problem = { type: 'about:blank', title, status, ...extra };
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': PROBLEM_CONTENT_TYPE },
    });
}

export function etag(item: Item): Record<string, string> {
    return item.version === null ? {} : { ETag: `"${item.version}"` };
}

export function parseEtag(value: string): string {
    return value.replace(/^W\//, '').replace(/^"(.*)"$/, '$1');
}
