/** The name of the query parameter that says where to go after the login (#508). */
export const NEXT_PARAM = 'next';

// Control characters, and any whitespace: the URL parser drops tabs and newlines, and trims spaces
// and C0 controls, which would turn `/\t/evil.example` into `//evil.example`.
// eslint-disable-next-line no-control-regex
const UNSAFE_CHARACTERS = /[\u0000-\u001f\u007f-\u009f\s]/u;

/**
 * The same-origin path that `value` holds, or `null`. This guards against open redirects: the
 * value starts with a single `/` (not `//` or `/\`), has no backslash, no control character and
 * no whitespace, and resolves to `origin`. The path is returned as the URL parser normalised it:
 * its path, query and fragment.
 */
export function safeNext(value: string | null | undefined, origin: string): string | null {
    if (typeof value !== 'string' || !value.startsWith('/')) {
        return null;
    }
    if (value.startsWith('//') || value.includes('\\') || UNSAFE_CHARACTERS.test(value)) {
        return null;
    }
    let url: URL;
    try {
        url = new URL(value, origin);
    } catch {
        return null;
    }
    if (url.origin !== origin || url.username !== '' || url.password !== '') {
        return null;
    }
    return `${url.pathname}${url.search}${url.hash}`;
}

const STORAGE_KEY = 'panneau:next';
// The time within which a user sent back with the same `next` is in a loop
const LOOP_WINDOW = 30_000;

/** Remembers that the app sends the browser to `next` now. */
export function rememberNext(next: string): void {
    try {
        window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ next, at: Date.now() }));
    } catch {
        // Without storage, a loop isn't caught.
    }
}

/**
 * Whether the app sent the browser to `next` a moment ago, which then came back with it: the
 * target sends a logged-in user back to the app.
 */
export function cameBackFrom(next: string): boolean {
    try {
        const stored = window.sessionStorage.getItem(STORAGE_KEY);
        if (stored === null) {
            return false;
        }
        const parsed: unknown = JSON.parse(stored);
        return (
            typeof parsed === 'object' &&
            parsed !== null &&
            'next' in parsed &&
            'at' in parsed &&
            parsed.next === next &&
            typeof parsed.at === 'number' &&
            Date.now() - parsed.at < LOOP_WINDOW
        );
    } catch {
        return false;
    }
}
