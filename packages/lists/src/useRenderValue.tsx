import type { ReactNode } from 'react';

import { getEntries, usePlugins, warnMissingEntry } from '@panneau/core';
import { summarizeCompound, useFieldsContext } from '@panneau/fields';
import { useLocaleName } from '@panneau/fields/localized';
import { isCompoundField } from '@panneau/protocol/runtime';
import { usePanneauIntl } from '@panneau/ui';

import styles from './displays/Displays.module.css';
import { builtInDisplays } from './displays/displays';
import type { DisplayEntry, DisplayVariant, ListColumn, ListItem } from './types';
import { getColumnValue, getLocalizedEntries, isLocalized } from './values';

/**
 * Renders the value of a column for an item with its display: those given, over those of the
 * plugins, over the built-in ones. A compound field without a display of its own (decision 0065)
 * shows the summaries of its field entry. Other columns without a known display, and compound
 * fields without a summary, show their value as text.
 *
 * Displays get the `variant`: `cell` in lists, `details` in the details of an item, where a
 * localized value shows each of its locales, under its name, the interface's locale first.
 */
export function useRenderValue(
    displays: Readonly<Record<string, DisplayEntry>> = {},
    variant: DisplayVariant = 'cell',
): (item: ListItem, column: ListColumn) => ReactNode {
    const intl = usePanneauIntl();
    const plugins = usePlugins();
    const { locales } = useFieldsContext();
    const localeName = useLocaleName();
    const allDisplays: Readonly<Record<string, DisplayEntry>> = Object.fromEntries(
        getEntries(plugins, 'displays', { builtIn: builtInDisplays, overrides: displays }),
    );
    const renderDisplay = (
        item: ListItem,
        column: ListColumn,
        value: unknown,
        own: DisplayEntry | undefined,
    ): ReactNode => {
        const field = column.field ?? null;
        if (own === undefined && field !== null && isCompoundField(field)) {
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
                value={value}
                item={item}
                column={column}
                field={field}
                {...(variant !== 'cell' ? { variant } : {})}
            />
        );
    };
    return (item, column) => {
        if (column.render !== undefined) {
            return column.render(item);
        }
        const display = column.display ?? null;
        const own =
            display !== null && Object.hasOwn(allDisplays, display)
                ? allDisplays[display]
                : undefined;
        if (display !== null && own === undefined) {
            // Shown as text, or as the summary of a compound field
            warnMissingEntry('displays', display);
        }
        if (variant === 'details' && isLocalized(column.field)) {
            const entries = getLocalizedEntries(
                item[column.field?.name ?? column.id],
                intl.locale,
                locales,
            );
            if (entries.length > 1) {
                return (
                    <dl className={styles.locales}>
                        {entries.map(([locale, value]) => (
                            <div key={locale} className={styles.locale}>
                                <dt className={styles.localeName}>{localeName(locale)}</dt>
                                <dd className={styles.localeValue} lang={locale}>
                                    {renderDisplay(item, column, value, own)}
                                </dd>
                            </div>
                        ))}
                    </dl>
                );
            }
        }
        return renderDisplay(item, column, getColumnValue(item, column, intl.locale), own);
    };
}
