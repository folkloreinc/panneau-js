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
 * plain object. A file (`Blob`, `File`, even empty) is filled. Other collections count by their
 * `length` or `size` (an empty `FileList`, `Map` or `Set` isn't filled); other objects are filled.
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
        if (typeof Blob !== 'undefined' && value instanceof Blob) {
            return true;
        }
        // A chosen file has no own keys: only plain objects are empty without them.
        if (isPlainObject(value)) {
            return Object.keys(value).length > 0;
        }
        const { length, size } = value as { length?: unknown; size?: unknown };
        if (typeof length === 'number') {
            return length > 0;
        }
        return typeof size === 'number' ? size > 0 : true;
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
