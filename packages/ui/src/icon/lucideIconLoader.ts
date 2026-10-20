import type { IconComponent } from './Icon';
import type { NamedIconLoader } from './namedIcons';

type IconImports = Readonly<Record<string, () => Promise<{ default: IconComponent }>>>;

let imports: Promise<IconImports> | null = null;

/**
 * Loads any Lucide icon by its name (the names of lucide.dev/icons). Each icon is its own chunk,
 * and so is the list of names, loaded the first time an icon is named. Bundlers emit a chunk per
 * Lucide icon for it, so it lives in its own entry point: only apps that pass it to `PanneauRoot`
 * pay for it.
 */
export const lucideIconLoader: NamedIconLoader = (name) => {
    imports ??= import('lucide-react/dynamicIconImports.mjs').then(
        (module) => module.default as unknown as IconImports,
        (error: unknown) => {
            imports = null;
            throw error;
        },
    );
    return imports.then((all) => {
        const load = Object.hasOwn(all, name) ? all[name] : undefined;
        return load !== undefined ? load().then((module) => module.default) : null;
    });
};
