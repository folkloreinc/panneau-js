import { useEffect, useSyncExternalStore } from 'react';

import type { IconComponent } from './Icon';

type IconImports = Readonly<Record<string, () => Promise<{ default: IconComponent }>>>;

type Entry =
    { status: 'loading' } | { status: 'loaded'; icon: IconComponent } | { status: 'missing' };

const entries = new Map<string, Entry>();
const components = new Map<string, IconComponent>();
const listeners = new Set<() => void>();
let imports: Promise<IconImports> | null = null;

function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

function setEntry(name: string, entry: Entry) {
    entries.set(name, entry);
    listeners.forEach((listener) => listener());
}

/**
 * Loads a Lucide icon by its name (`send`, `calendar-days`: the names of lucide.dev/icons), and
 * resolves with its component, or with `null` for a name Lucide doesn't have. Each icon is its own
 * module, and so is the list of names: neither is in the bundle until a named icon is used.
 */
export function loadNamedIcon(name: string): Promise<IconComponent | null> {
    const entry = entries.get(name);
    if (entry?.status === 'loaded') {
        return Promise.resolve(entry.icon);
    }
    if (entry?.status === 'missing') {
        return Promise.resolve(null);
    }
    if (entry === undefined) {
        setEntry(name, { status: 'loading' });
    }
    imports ??= import('lucide-react/dynamicIconImports.mjs').then(
        (module) => module.default as unknown as IconImports,
    );
    return imports
        .then((all) => {
            const load = Object.hasOwn(all, name) ? all[name] : undefined;
            return load !== undefined ? load().then((module) => module.default) : null;
        })
        .then(
            (icon) => {
                if (icon === null) {
                    console.warn(`[panneau] Lucide has no icon named "${name}".`);
                    setEntry(name, { status: 'missing' });
                } else {
                    setEntry(name, { status: 'loaded', icon });
                }
                return icon;
            },
            (error: unknown) => {
                // A chunk that failed to load (offline): the icon is loaded again when it mounts.
                entries.delete(name);
                imports = null;
                throw error;
            },
        );
}

/**
 * An icon component for a Lucide icon name, as definitions name them (`"icon": "send"`). It goes
 * wherever an icon component goes (`<Button icon={getNamedIcon('send')}>`), and is the same
 * component for the same name. It loads the icon the first time it renders (`loadNamedIcon()`),
 * and renders an empty space of the same size until then. A name Lucide doesn't have renders
 * nothing.
 */
export function getNamedIcon(name: string): IconComponent {
    const existing = components.get(name);
    if (existing !== undefined) {
        return existing;
    }
    const NamedIcon: IconComponent = ({ size = 24, className, ...props }) => {
        const entry = useSyncExternalStore(
            subscribe,
            () => entries.get(name),
            () => entries.get(name),
        );
        useEffect(() => {
            if (entries.get(name) === undefined) {
                loadNamedIcon(name).catch(() => undefined);
            }
        }, []);
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
