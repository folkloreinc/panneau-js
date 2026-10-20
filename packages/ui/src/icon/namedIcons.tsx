import { createContext, use, useEffect, useSyncExternalStore } from 'react';

import type { IconComponent } from './Icon';

/**
 * Loads an icon component from its name, as definitions name icons (`"icon": "send"`), or
 * resolves with `null` for a name it doesn't know. `lucideIconLoader` of `@panneau/ui/named-icons`
 * loads any Lucide icon; an app can load only the icons its definitions use.
 */
export type NamedIconLoader = (name: string) => Promise<IconComponent | null>;

type Entry =
    { status: 'loading' } | { status: 'loaded'; icon: IconComponent } | { status: 'missing' };

/** Icons by name, for each loader. */
const caches = new WeakMap<NamedIconLoader, Map<string, Entry>>();
const components = new Map<string, IconComponent>();
const listeners = new Set<() => void>();

/** The loader of named icons, set by `PanneauRoot`'s `iconLoader`. */
export const NamedIconLoaderContext = createContext<NamedIconLoader | null>(null);

function cache(loader: NamedIconLoader): Map<string, Entry> {
    let entries = caches.get(loader);
    if (entries === undefined) {
        entries = new Map();
        caches.set(loader, entries);
    }
    return entries;
}

function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

function setEntry(loader: NamedIconLoader, name: string, entry: Entry | undefined) {
    if (entry === undefined) {
        cache(loader).delete(name);
    } else {
        cache(loader).set(name, entry);
    }
    listeners.forEach((listener) => listener());
}

/**
 * Loads an icon by its name with a loader, once per loader and name, and resolves with its
 * component, or with `null` for a name the loader doesn't know.
 */
export function loadNamedIcon(
    name: string,
    loader: NamedIconLoader,
): Promise<IconComponent | null> {
    const entry = cache(loader).get(name);
    if (entry?.status === 'loaded') {
        return Promise.resolve(entry.icon);
    }
    if (entry?.status === 'missing') {
        return Promise.resolve(null);
    }
    if (entry === undefined) {
        setEntry(loader, name, { status: 'loading' });
    }
    return loader(name).then(
        (icon) => {
            if (icon === null) {
                console.warn(`[panneau] No icon named "${name}".`);
                setEntry(loader, name, { status: 'missing' });
            } else {
                setEntry(loader, name, { status: 'loaded', icon });
            }
            return icon;
        },
        (error: unknown) => {
            // A chunk that failed to load (offline): the icon is loaded again when it mounts.
            setEntry(loader, name, undefined);
            throw error;
        },
    );
}

let warnedWithoutLoader = false;

/**
 * An icon component for an icon name, as definitions name them (`"icon": "send"`). It goes
 * wherever an icon component goes (`<Button icon={getNamedIcon('send')}>`), and is the same
 * component for the same name. It loads the icon with the `iconLoader` of `PanneauRoot` the first
 * time it renders, and renders an empty space of the same size until then, or without a loader. A
 * name the loader doesn't know renders nothing.
 */
export function getNamedIcon(name: string): IconComponent {
    const existing = components.get(name);
    if (existing !== undefined) {
        return existing;
    }
    const NamedIcon: IconComponent = ({ size = 24, className, ...props }) => {
        const loader = use(NamedIconLoaderContext);
        const entry = useSyncExternalStore(
            subscribe,
            () => (loader !== null ? cache(loader).get(name) : undefined),
            () => (loader !== null ? cache(loader).get(name) : undefined),
        );
        useEffect(() => {
            if (loader === null) {
                if (!warnedWithoutLoader) {
                    warnedWithoutLoader = true;
                    console.warn(
                        `[panneau] The icon "${name}" is named, but PanneauRoot has no iconLoader: pass lucideIconLoader from @panneau/ui/named-icons.`,
                    );
                }
                return;
            }
            if (cache(loader).get(name) === undefined) {
                loadNamedIcon(name, loader).catch(() => undefined);
            }
        }, [loader]);
        if (entry?.status === 'loaded') {
            const Loaded = entry.icon;
            return <Loaded size={size} className={className} {...props} />;
        }
        if (entry?.status === 'missing') {
            return null;
        }
        const { 'aria-hidden': hidden, 'aria-label': label, role } = props;
        return (
            <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                className={className}
                aria-hidden={hidden}
                aria-label={label}
                role={role}
                data-loading=""
            />
        );
    };
    NamedIcon.displayName = `NamedIcon(${name})`;
    components.set(name, NamedIcon);
    return NamedIcon;
}
