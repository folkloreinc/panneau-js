/** Values of a form or an item, keyed by field name. */
export type Values = Record<string, unknown>;

function isIndex(segment: string): boolean {
    return /^\d+$/.test(segment);
}

function setIn(current: unknown, segments: string[], value: unknown): unknown {
    const [segment, ...rest] = segments;
    if (segment === undefined) {
        return value;
    }
    if (isIndex(segment)) {
        const array = Array.isArray(current) ? [...(current as unknown[])] : [];
        array[Number(segment)] = setIn(array[Number(segment)], rest, value);
        return array;
    }
    const record =
        current !== null && typeof current === 'object' && !Array.isArray(current)
            ? (current as Record<string, unknown>)
            : {};
    return { ...record, [segment]: setIn(record[segment], rest, value) };
}

/**
 * Returns a copy of `values` with `value` at a dot path (`title.fr`, `blocks.2.body`). Missing
 * objects and arrays are created: numeric segments create arrays.
 */
export function setValue<T extends Values>(values: T, path: string, value: unknown): T {
    if (path === '') {
        return value as T;
    }
    return setIn(values, path.split('.'), value) as T;
}

/** Deep equality of JSON-like values. */
export function isEqual(a: unknown, b: unknown): boolean {
    if (Object.is(a, b)) {
        return true;
    }
    if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') {
        return false;
    }
    if (Array.isArray(a) !== Array.isArray(b)) {
        return false;
    }
    if (Array.isArray(a) && Array.isArray(b)) {
        return a.length === b.length && a.every((item, index) => isEqual(item, b[index]));
    }
    const left = a as Record<string, unknown>;
    const right = b as Record<string, unknown>;
    const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
    return [...keys].every((key) => isEqual(left[key], right[key]));
}

/** Whether `path` is `parent` or inside it (`title.fr` is inside `title`). */
export function isPathWithin(path: string, parent: string): boolean {
    return parent === '' || path === parent || path.startsWith(`${parent}.`);
}
