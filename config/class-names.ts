import { basename } from 'node:path';

/** `ListBox` → `list-box`, `iconButton` → `icon-button`. */
function kebabCase(value: string): string {
    return value
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
        .toLowerCase();
}

/**
 * The component of a CSS Module, from its file name: `Button.module.css` → `button`,
 * `ListBox.module.css` → `list-box`, `PanneauRoot.module.css` → `root`.
 */
export function cssModuleComponent(filename: string): string {
    const name = basename(filename.replace(/\?.*$/, '')).replace(/\.module\.css$/, '');
    return kebabCase(name.replace(/^Panneau(?=[A-Z])/, ''));
}

/**
 * The class name a CSS Module class gets in every build: stable, readable and prefixed, without
 * a hash, so that projects can target it like Bootstrap's `.btn` (decision 0024).
 *
 * - The class named after the component is `panneau-<component>`: `.badge` in `Badge.module.css`
 *   gives `panneau-badge`.
 * - Other classes are `panneau-<component>-<class>`: `.header` in `Card.module.css` gives
 *   `panneau-card-header`, and `.sm` in `Button.module.css` gives `panneau-button-sm`.
 */
export function stableClassName(local: string, filename: string): string {
    const component = cssModuleComponent(filename);
    const name = kebabCase(local);
    return name === component ? `panneau-${component}` : `panneau-${component}-${name}`;
}
