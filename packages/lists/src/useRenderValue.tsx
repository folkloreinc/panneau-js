import type { ReactNode } from 'react';

import { usePlugins } from '@panneau/core';
import { summarizeCompound } from '@panneau/fields';
import { isCompoundField } from '@panneau/protocol/runtime';
import { usePanneauIntl } from '@panneau/ui';

import styles from './displays/Displays.module.css';
import { builtInDisplays } from './displays/displays';
import type { DisplayEntry, ListColumn, ListItem } from './types';
import { getColumnValue } from './values';

/**
 * Renders the value of a column for an item with its display: those given, over those of the
 * plugins, over the built-in ones. A compound field without a display of its own (decision 0065)
 * shows the summaries of its field entry. Other columns without a known display, and compound
 * fields without a summary, show their value as text.
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
        const own =
            column.display !== undefined && column.display !== null
                ? allDisplays[column.display]
                : undefined;
        const field = column.field ?? null;
        if (own === undefined && field !== null && isCompoundField(field)) {
            const value = getColumnValue(item, column, intl.locale);
            const summary = summarizeCompound(plugins.fields.get(field.type), value, {
                field,
                locale: intl.locale,
            });
            if (summary !== null) {
                return (
                    <span className={styles.text} data-clamp="">
                        {summary}
                    </span>
                );
            }
        }
        const Display = own ?? builtInDisplays.text;
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
