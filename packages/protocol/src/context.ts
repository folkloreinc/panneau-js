// The current context (decision 0043): the values of its params, in the `Panneau-Context` header
// and in the prefix of the client routes. This module doesn't import zod.

/** Values of the params of the context, by name. A param without a value is left out. */
export type ContextValues = Readonly<Record<string, string>>;

/** Only the values that are set: `null`, `undefined` and empty values are left out. */
function setValues(values: Readonly<Record<string, string | null | undefined>>) {
    return Object.entries(values).filter(
        (entry): entry is [string, string] => typeof entry[1] === 'string' && entry[1] !== '',
    );
}

/**
 * The value of the `Panneau-Context` header: the values in the format of a query string, in the
 * order of `names` (the order of the params of the definition) when given. Empty without values.
 */
export function formatContextHeader(
    values: Readonly<Record<string, string | null | undefined>>,
    names?: readonly string[],
): string {
    const entries = setValues(values);
    if (names !== undefined) {
        entries.sort(([a], [b]) => names.indexOf(a) - names.indexOf(b));
    }
    return new URLSearchParams(entries).toString();
}

/** The values of a `Panneau-Context` header. The first value of a name wins; empty ones are left out. */
export function parseContextHeader(header: string | null | undefined): ContextValues {
    const values: Record<string, string> = {};
    new URLSearchParams(header ?? '').forEach((value, name) => {
        if (value !== '' && !(name in values)) {
            values[name] = value;
        }
    });
    return values;
}

/**
 * The values of the context in the params before `name`: those that the request of its choices
 * sends, since a param depends on the params before it.
 */
export function contextBefore(
    values: ContextValues,
    names: readonly string[],
    name: string,
): ContextValues {
    const before = names.slice(0, Math.max(0, names.indexOf(name)));
    return Object.fromEntries(setValues(values).filter(([key]) => before.includes(key)));
}
