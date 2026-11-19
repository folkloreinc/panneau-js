/**
 * Whether the system asks for less motion (`prefers-reduced-motion: reduce`), read when it is
 * called: for what moves from a script, such as a smooth scroll, a delay before an element leaves
 * or a view transition. Motion in CSS reads the media query itself.
 */
export function prefersReducedMotion(): boolean {
    return (
        typeof window !== 'undefined' &&
        (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false)
    );
}
