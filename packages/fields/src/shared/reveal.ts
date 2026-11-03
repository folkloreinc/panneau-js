import { createContext, use, useEffect, useEffectEvent } from 'react';

/** Shows what holds a path, such as its tab or its locale, so that its field can be reached. */
export type Revealer = (path: string) => void;

/** Where a form asks the containers of its fields to show a path, before it focuses its field. */
export interface RevealRegistry {
    add(revealer: Revealer): () => void;
    reveal(path: string): void;
}

export function createRevealRegistry(): RevealRegistry {
    const revealers = new Set<Revealer>();
    return {
        add(revealer) {
            revealers.add(revealer);
            return () => {
                revealers.delete(revealer);
            };
        },
        reveal(path) {
            revealers.forEach((revealer) => revealer(path));
        },
    };
}

/**
 * The reveal registry of the closest form. Containers that hide fields (tabs, sections, the
 * locales of a localized field) add a revealer to it.
 */
export const RevealContext = createContext<RevealRegistry>(createRevealRegistry());

/** Calls the revealer when the form reveals a path, for as long as the component is mounted. */
export function useRevealer(revealer: Revealer): void {
    const registry = use(RevealContext);
    const onReveal = useEffectEvent(revealer);
    useEffect(() => registry.add((path) => onReveal(path)), [registry]);
}
