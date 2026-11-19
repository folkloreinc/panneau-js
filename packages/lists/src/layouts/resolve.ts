import type { ListLayoutEntry } from '../types';
import { builtInLayouts } from './builtIn';

export interface ListLayoutOptions {
    /** Layouts by id: the built-in ones, those of the plugins, then those of the list. */
    components: Readonly<Record<string, ListLayoutEntry>>;
    /** The layouts the list offers, the first being the default. */
    layouts: readonly string[];
    /** The layout the user chose (the view of the list state). */
    chosen: string | undefined;
    /** The layout, controlled. */
    controlled: string | undefined;
    itemImage: string | undefined;
    calendar: unknown;
}

/** Layouts by id: the built-in ones, then those of the plugins, then those given. */
export function getLayoutComponents(
    plugins: Iterable<readonly [string, unknown]>,
    components: Readonly<Record<string, ListLayoutEntry>> | undefined,
): Record<string, ListLayoutEntry> {
    return {
        ...builtInLayouts,
        ...(Object.fromEntries(plugins) as Record<string, ListLayoutEntry>),
        ...components,
    };
}

/**
 * The layouts a list can show, and the one it shows. Layouts without a component (a plugin's that
 * isn't installed) are left out, and so are the gallery without images and the calendar without a
 * calendar.
 */
export function resolveListLayout({
    components,
    layouts: offered,
    chosen,
    controlled,
    itemImage,
    calendar,
}: ListLayoutOptions): { layouts: string[]; layout: string } {
    const available = offered.filter(
        (id) =>
            components[id] !== undefined &&
            (id !== 'gallery' || itemImage !== undefined) &&
            (id !== 'calendar' || (calendar !== null && calendar !== undefined)),
    );
    const layouts = available.length > 0 ? available : ['table'];
    const valid = chosen !== undefined && layouts.includes(chosen) ? chosen : undefined;
    return { layouts, layout: controlled ?? valid ?? layouts[0] ?? 'table' };
}
