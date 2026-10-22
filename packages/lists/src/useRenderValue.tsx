import type { ReactNode } from 'react';

import { usePlugins } from '@panneau/core';
import { usePanneauIntl } from '@panneau/ui';

import { builtInDisplays } from './displays/displays';
import type { DisplayEntry, ListColumn, ListItem } from './types';
import { getColumnValue } from './values';

/**
 * Renders the value of a column for an item with its display: those given, over those of the
 * plugins, over the built-in ones. Columns without a known display show their value as text.
 */
export function useRenderValue(
    displays: Readonly<Record<string, DisplayEntry>> = {},
): (item: ListItem, column: ListColumn) => ReactNode {
    const intl = usePanneauIntl();
    const plugins = usePlugins();
    const allDisplays: Record<string, DisplayEntry> = {
        ...builtInDisplays,
        ...(Object.fromEntries(plugins.displays) as Record<string, DisplayEntry>),
        ...displays,
    };
    return (item, column) => {
        if (column.render !== undefined) {
            return column.render(item);
        }
        const Display =
            (column.display !== undefined && column.display !== null
                ? allDisplays[column.display]
                : undefined) ?? builtInDisplays.text;
        if (Display === undefined) {
            return null;
        }
        return (
            <Display
                value={getColumnValue(item, column, intl.locale)}
                item={item}
                column={column}
                field={column.field ?? null}
            />
        );
    };
}
