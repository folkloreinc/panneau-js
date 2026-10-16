import { X } from 'lucide-react';
import { useState } from 'react';

import type { Field, Filter, FilterValue } from '@panneau/protocol';
import { Button, IconButton, usePanneauIntl } from '@panneau/ui';

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
    /** Controls by filter type, over the built-in ones. */
    controls?: Readonly<Record<string, FilterEntry>> | undefined;
}

/** A control for each filter of the list. */
export function FilterControls({
    filters,
    values,
    onChange,
    onLabel,
    controls,
    columns,
    fields,
    labels,
}: FilterControlsProps) {
    const intl = usePanneauIntl();
    return (
        <div
            role="group"
            aria-label={intl.formatMessage(messages.filters)}
            className={styles.filters}
        >
            {filters.map((filter) => {
                const Control =
                    controls?.[filter.type] ?? builtInFilters[filter.type] ?? builtInFilters.text;
                if (Control === undefined) {
                    return null;
                }
                return (
                    <Control
                        key={filter.id}
                        filter={filter}
                        label={getFilterLabel(filter, columns, fields)}
                        options={getFilterOptions(filter, columns, fields)}
                        value={values[filter.id]}
                        onChange={(value) => onChange(filter.id, value)}
                        onLabel={(value, label) => onLabel(filter.id, value, label)}
                        getValueLabel={(value) => labels[filter.id]?.[value] ?? null}
                    />
                );
            })}
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
            <Button variant="ghost" size="sm" onPress={onClear}>
                {intl.formatMessage(messages.clearFilters)}
            </Button>
        </div>
    );
}
