/** Joins class names, skipping empty and repeated ones. */
export function cx(...classNames: (string | false | null | undefined)[]): string {
    return [
        ...new Set(
            classNames.flatMap((className) =>
                typeof className === 'string' ? className.split(/\s+/).filter(Boolean) : [],
            ),
        ),
    ].join(' ');
}
