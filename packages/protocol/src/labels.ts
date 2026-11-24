// Labels for what the definition leaves unlabeled. Fields, columns, filters and pages may leave out
// their `label`: the interface then shows their key, made readable for humans. It is a fallback,
// not a translation: a definition that wants a label in its locale gives one.

/** The words of a key: split on `_`, `-`, `.`, spaces, and the humps of camel case. */
function splitKey(key: string): string[] {
    return (
        key
            // `authorId` → `author Id`, `h1Title` → `h1 Title`
            .replace(/([a-z\d])([A-Z])/g, '$1 $2')
            // `URLPath` → `URL Path`
            .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
            .split(/[\s._-]+/)
            .filter((word) => word !== '')
    );
}

/**
 * A key made readable, for a field, a column, a filter or a page without a label (issue 408):
 * words split on `_`, `-`, `.`, spaces and camel case, in sentence case.
 *
 * - `published_at` and `publishedAt` → "Published at";
 * - a trailing `_id` or `Id` names what it points to: `author_id` → "Author", and `id` alone →
 *   "ID";
 * - every segment of a path stays, so that two keys don't read the same: `seo.title` → "Seo
 *   title";
 * - words in capitals are acronyms and stay so: `seoURL` → "Seo URL", `id` anywhere → "ID";
 * - digits stay with their word: `address_line_2` → "Address line 2", `h1Title` → "H1 title".
 *
 * Text already readable keeps its words: "Published at" stays.
 */
export function humanizeKey(key: string): string {
    const words = splitKey(key);
    // A key all in capitals (`PUBLISHED_AT`) is a constant, not a run of acronyms.
    if (words.length > 1 && !/[a-z]/.test(key)) {
        words.forEach((word, index) => {
            words[index] = word.toLowerCase();
        });
    }
    if (words.length > 1 && /^id$/i.test(words[words.length - 1] ?? '')) {
        words.pop();
    }
    return words
        .map((word, index) => {
            if (/^id$/i.test(word)) {
                return 'ID';
            }
            // An acronym (`URL`, `SEO`) stays in capitals.
            if (word.length > 1 && word === word.toUpperCase() && /[A-Z]/.test(word)) {
                return word;
            }
            const lower = word.toLowerCase();
            return index === 0 ? lower.charAt(0).toUpperCase() + lower.slice(1) : lower;
        })
        .join(' ');
}

/**
 * The label to show for something with a `label` and a key: its `label` as given, an empty string
 * included, or its key made readable (`humanizeKey()`).
 */
export function labelOrKey(label: string | null | undefined, key: string): string {
    return label ?? humanizeKey(key);
}

/** The label of a field: its `label`, or its name made readable (`humanizeKey()`). */
export function getFieldLabel(field: { name: string; label?: string | undefined }): string {
    return labelOrKey(field.label, field.name);
}
