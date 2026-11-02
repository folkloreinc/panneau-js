/** Reads a value at a dot path (`blocks.2.title.fr`). */
export function getValue(values: unknown, path: string): unknown {
    if (path === '') {
        return values;
    }
    return path.split('.').reduce<unknown>((current, key) => {
        if (current === null || typeof current !== 'object') {
            return undefined;
        }
        return (current as Record<string, unknown>)[key];
    }, values);
}

/**
 * Whether a value counts as filled: not null, not an empty or blank string, not an empty array or
 * plain object. A file (`Blob`, `File`) or any other object that isn't a plain one is filled.
 */
export function isFilled(value: unknown): boolean {
    if (value === null || value === undefined) {
        return false;
    }
    if (typeof value === 'string') {
        return value.trim() !== '';
    }
    if (Array.isArray(value)) {
        return value.length > 0;
    }
    if (typeof value === 'object') {
        // A chosen file has no own keys: only plain objects are empty without them.
        return !isPlainObject(value) || Object.keys(value).length > 0;
    }
    return true;
}

function isPlainObject(value: object): boolean {
    const prototype: unknown = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function isEqual(a: unknown, b: unknown): boolean {
    if (a === b) {
        return true;
    }
    if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
        return false;
    }
    return JSON.stringify(a) === JSON.stringify(b);
}
