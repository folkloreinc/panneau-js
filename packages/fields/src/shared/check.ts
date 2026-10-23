import type { FieldCheckRequest, FieldCheckResponse } from '@panneau/protocol';

/**
 * Where fields with `check` check their value as it is typed: whether a slug is available, and
 * its URL. The value's locale and the form's values come with each check.
 */
export interface FieldCheckSource {
    check(
        field: string,
        request: { value: string; locale?: string; values?: Record<string, unknown> },
        options: { signal: AbortSignal },
    ): Promise<FieldCheckResponse>;
}

/** What `createFieldCheckSource()` needs from an adapter: the `checkField()` of `@panneau/data`. */
export interface FieldCheckAdapter {
    checkField?(
        resource: string,
        field: string,
        request: FieldCheckRequest,
        options?: { signal?: AbortSignal },
    ): Promise<FieldCheckResponse>;
}

/**
 * The check source of a form of a resource, through an adapter (`POST
 * /resources/{resource}/fields/{field}/check`): `id` is the item being edited, or null when
 * creating one. Null when the adapter can't check.
 */
export function createFieldCheckSource(
    adapter: FieldCheckAdapter,
    resource: string,
    id: string | null = null,
): FieldCheckSource | null {
    const { checkField } = adapter;
    if (checkField === undefined) {
        return null;
    }
    return {
        check: (field, request, { signal }) =>
            checkField.call(adapter, resource, field, { ...request, id }, { signal }),
    };
}
