/**
 * A theme: design tokens, as CSS variables without the leading `--`, with optional overrides for
 * the dark scheme. It has the same shape as the `Theme` of `@panneau/core` plugins.
 */
export interface Theme {
    label?: string;
    /** Tokens of the light scheme, or of both schemes without `dark`: `{ 'panneau-color-accent': '#05f' }`. */
    tokens: Record<string, string>;
    /** Tokens that change in the dark scheme. */
    dark?: Record<string, string>;
}

/** `auto` follows the system setting (`prefers-color-scheme`). */
export type ColorScheme = 'light' | 'dark' | 'auto';

function declarations(tokens: Record<string, string>): string {
    return Object.entries(tokens)
        .filter(([name, value]) => /^[a-zA-Z0-9-_]+$/.test(name) && !/[{};<]/.test(value))
        .map(([name, value]) => `--${name}:${value};`)
        .join('');
}

/** A short, stable hash of a string, to scope the CSS of a theme. */
export function hashString(value: string): string {
    let hash = 5381;
    for (let index = 0; index < value.length; index += 1) {
        hash = (hash * 33) ^ value.charCodeAt(index);
    }
    return (hash >>> 0).toString(36);
}

/**
 * The CSS of a theme, scoped to the roots that carry `data-panneau-theme="<scope>"`. Its rules are
 * more specific than the default tokens, and dark overrides more specific than light ones. Token
 * names must be plain identifiers, and values can't contain `{`, `}`, `;` or `<`: other entries are
 * ignored.
 */
export function getThemeCss(theme: Theme, scope: string): string {
    const root = `[data-panneau-theme="${scope}"]`;
    const light = declarations(theme.tokens);
    const dark = theme.dark !== undefined ? declarations(theme.dark) : '';
    return [
        light !== '' ? `${root}{${light}}` : '',
        dark !== '' ? `${root}[data-color-scheme="dark"]{${dark}}` : '',
        dark !== ''
            ? `@media (prefers-color-scheme: dark){${root}[data-color-scheme="auto"]{${dark}}}`
            : '',
    ].join('');
}
