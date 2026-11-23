import { X } from 'lucide-react';
import { type ReactNode, useRef, useState } from 'react';

import { resolveEntry, usePlugins } from '@panneau/core';
import type { Field, Filter, FilterValue } from '@panneau/protocol';
import { IDS_FILTER } from '@panneau/protocol/runtime';
import { Button, IconButton, usePanneauIntl } from '@panneau/ui';

import { cx } from '../cx';
import { messages } from '../messages';
import type { FilterEntry, ListColumn } from '../types';
import styles from './Filters.module.css';
import { builtInFilters } from './controls';
import { formatFilterValue, getFilterLabel, getFilterOptions } from './format';

/** Labels of filter values (relation ids), by filter id, for the chips. */
export type FilterLabels = Readonly<Record<string, Readonly<Record<string, string>>>>;

/** Remembers the labels of filter values, for the chips of active filters. */
export function useFilterLabels(): {
    labels: FilterLabels;
    remember: (filter: string, value: string, label: string) => void;
} {
    const [labels, setLabels] = useState<FilterLabels>({});
    return {
        labels,
        remember: (filter, value, label) =>
            setLabels((current) =>
                current[filter]?.[value] === label
                    ? current
                    : { ...current, [filter]: { ...current[filter], [value]: label } },
            ),
    };
}

interface FilterContext {
    columns: readonly ListColumn[];
    fields: readonly Field[];
    labels: FilterLabels;
}

export interface FilterControlsProps extends FilterContext {
    filters: readonly Filter[];
    /** The current filter values, by filter id. */
    values: Readonly<Record<string, FilterValue>>;
    onChange: (id: string, value: FilterValue | undefined) => void;
    onLabel: (filter: string, value: string, label: string) => void;
    /**
     * Controls by filter type, over the built-in ones and those of the plugins (the `filters`
     * kind, decision 0097).
     */
    controls?: Readonly<Record<string, FilterEntry>> | undefined;
    /** One control under the other, each as wide as the group: in a popover or a sheet. */
    stacked?: boolean;
    /** The accessible name of the group. Defaults to "Filters". */
    'aria-label'?: string;
}

/** Whether a filter has a value: the list is filtered by it. */
export function isFilterActive(
    values: Readonly<Record<string, FilterValue>>,
    filter: Pick<Filter, 'id'>,
): boolean {
    return values[filter.id] !== undefined;
}

/**
 * A control for each filter of the list. A filter with a value is marked as active, in the tones
 * of what is selected (`--panneau-selected-*`), with a button that clears it.
 */
export function FilterControls({
    filters,
    values,
    onChange,
    onLabel,
    controls,
    columns,
    fields,
    labels,
    stacked = false,
    'aria-label': ariaLabel,
}: FilterControlsProps) {
    const intl = usePanneauIntl();
    const plugins = usePlugins();
    return (
        <div
            role="group"
            aria-label={ariaLabel ?? intl.formatMessage(messages.filters)}
            className={cx(styles.filters, stacked && styles.stacked)}
        >
            {filters.map((filter) => {
                // A type that nothing gives is a text filter, with a warning in development
                const Control =
                    resolveEntry(plugins, 'filters', filter.type, {
                        builtIn: builtInFilters,
                        overrides: controls,
                    }) ?? builtInFilters.text;
                if (Control === undefined) {
                    return null;
                }
                const label = getFilterLabel(filter, columns, fields);
                return (
                    <FilterItem
                        key={filter.id}
                        label={label}
                        // A switch says itself whether it is on
                        clearable={filter.type !== 'toggle'}
                        isActive={isFilterActive(values, filter)}
                        onClear={() => onChange(filter.id, undefined)}
                    >
                        <Control
                            filter={filter}
                            label={label}
                            options={getFilterOptions(filter, columns, fields)}
                            value={values[filter.id]}
                            onChange={(value) => onChange(filter.id, value)}
                            onLabel={(value, label) => onLabel(filter.id, value, label)}
                            getValueLabel={(value) => labels[filter.id]?.[value] ?? null}
                        />
                    </FilterItem>
                );
            })}
        </div>
    );
}

interface FilterItemProps {
    label: string;
    isActive: boolean;
    clearable: boolean;
    onClear: () => void;
    children: ReactNode;
}

/** A filter control, marked when it has a value, with a button that clears it. */
function FilterItem({ label, isActive, clearable, onClear, children }: FilterItemProps) {
    const intl = usePanneauIntl();
    const item = useRef<HTMLDivElement>(null);
    return (
        <div
            ref={item}
            className={cx(styles.item, isActive && styles.active)}
            data-active={isActive ? 'true' : undefined}
        >
            {children}
            {isActive && clearable ? (
                <IconButton
                    icon={X}
                    label={intl.formatMessage(messages.clearFilter, { filter: label })}
                    className={styles.clear}
                    onPress={() => {
                        onClear();
                        // The button goes away with the value: focus stays on the filter.
                        item.current
                            ?.querySelector<HTMLElement>('input, button, [tabindex="0"]')
                            ?.focus();
                    }}
                />
            ) : null}
        </div>
    );
}

export interface FilterChipsProps extends FilterContext {
    filters: readonly Filter[];
    values: Readonly<Record<string, FilterValue>>;
    /** The search, shown as a chip too. */
    q?: string | undefined;
    onRemove: (id: string) => void;
    onClearSearch: () => void;
    onClear: () => void;
}

/** The active filters and the search, as chips that remove them, and a button to clear them all. */
export function FilterChips({
    filters,
    values,
    q,
    onRemove,
    onClearSearch,
    onClear,
    columns,
    fields,
    labels,
}: FilterChipsProps) {
    const intl = usePanneauIntl();
    const chips = Object.entries(values).map(([id, value]) => {
        // The filter of every list on ids (decision 0069): the count of its items, set by a link.
        if (id === IDS_FILTER) {
            const count = (Array.isArray(value) ? value : [value]).length;
            return { id, label: intl.formatMessage(messages.idsChip, { count }), text: null };
        }
        const filter = filters.find((candidate) => candidate.id === id) ?? { id, type: 'text' };
        const label = getFilterLabel(filter, columns, fields);
        const text =
            filter.type === 'toggle'
                ? null
                : formatFilterValue(filter, value, {
                      intl,
                      options: getFilterOptions(filter, columns, fields),
                      getValueLabel: (entry) => labels[id]?.[entry] ?? null,
                  });
        return { id, label, text };
    });
    const search = q !== undefined && q !== '' ? q : null;
    if (chips.length === 0 && search === null) {
        return null;
    }
    return (
        <div className={styles.chips}>
            <ul aria-label={intl.formatMessage(messages.activeFilters)} className={styles.chips}>
                {search !== null ? (
                    <li className={styles.chip}>
                        <span className={styles.chipText}>
                            {intl.formatMessage(messages.searchChip, { q: search })}
                        </span>
                        <IconButton
                            icon={X}
                            size="sm"
                            showTooltip={false}
                            label={intl.formatMessage(messages.removeFilter, {
                                filter: intl.formatMessage(messages.searchChip, { q: search }),
                            })}
                            onPress={onClearSearch}
                        />
                    </li>
                ) : null}
                {chips.map(({ id, label, text }) => {
                    const name = text !== null ? `${label}: ${text}` : label;
                    return (
                        <li key={id} className={styles.chip}>
                            <span className={styles.chipText}>
                                {text !== null ? (
                                    <>
                                        <span className={styles.chipLabel}>{label}:</span> {text}
                                    </>
                                ) : (
                                    label
                                )}
                            </span>
                            <IconButton
                                icon={X}
                                size="sm"
                                showTooltip={false}
                                label={intl.formatMessage(messages.removeFilter, { filter: name })}
                                onPress={() => onRemove(id)}
                            />
                        </li>
                    );
                })}
            </ul>
            <Button appearance="ghost" size="sm" onPress={onClear}>
                {intl.formatMessage(messages.clearFilters)}
            </Button>
        </div>
    );
}
