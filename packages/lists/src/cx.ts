/** Joins class names, skipping empty ones. */
export function cx(...classNames: (string | false | null | undefined)[]): string {
    return classNames.filter(Boolean).join(' ');
}
