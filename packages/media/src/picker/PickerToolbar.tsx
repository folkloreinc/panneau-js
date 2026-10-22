import { Lock, Search, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

import { mediaMessages as messages } from '@panneau/intl';
import type { Filter, FilterValue } from '@panneau/protocol';
import { isFilterRange } from '@panneau/protocol/runtime';
import { Badge, Button, Select, Switch, TextInput, usePanneauIntl } from '@panneau/ui';

import styles from './MediaPicker.module.css';
import { MEDIA_TYPES, sortLabel, typeLabel } from './format';
import type { MediaSort, MediaType } from './types';
import type { BrowseQuery } from './useMediaBrowser';

/** The filter types the picker shows. Others are left out. */
const SHOWN = new Set(['select', 'toggle', 'text']);

function isSet(value: FilterValue | undefined): boolean {
    return (
        value !== undefined &&
        value !== '' &&
        value !== false &&
        !(Array.isArray(value) && value.length === 0)
    );
}

export interface PickerToolbarProps {
    query: BrowseQuery;
    onQueryChange: (query: BrowseQuery) => void;
    sorts: readonly MediaSort[];
    /** The filters the user can change: the source's and the opener's. */
    filters: readonly Filter[];
    /** The opener's filters, which the user can't change, with the filters that name them. */
    locked: Readonly<Record<string, FilterValue>>;
    lockedFilters: readonly Filter[];
}

/**
 * Search, the type filter, the sort, and a row of the source's and the opener's filters, with
 * the opener's locked filters shown as such.
 */
export function PickerToolbar({
    query,
    onQueryChange,
    sorts,
    filters,
    locked,
    lockedFilters,
}: PickerToolbarProps) {
    const intl = usePanneauIntl();
    const shown = filters.filter((filter) => SHOWN.has(filter.type) && !(filter.id in locked));
    const active = shown.filter((filter) => isSet(query.filter[filter.id])).length;
    const lockedEntries = Object.entries(locked);
    const [open, setOpen] = useState(active > 0 || lockedEntries.length > 0);
    const set = (change: Partial<BrowseQuery>) => onQueryChange({ ...query, ...change });
    const setFilter = (id: string, value: FilterValue | undefined) =>
        set({
            filter: Object.fromEntries([
                ...Object.entries(query.filter).filter(([key]) => key !== id),
                ...(value !== undefined ? [[id, value] as const] : []),
            ]),
        });
    const lockedType = 'type' in locked;

    const valueLabel = (id: string, value: FilterValue): string => {
        if (isFilterRange(value)) {
            return [value.from, value.to].filter((bound) => bound !== undefined).join(' – ');
        }
        const values = Array.isArray(value) ? value : [value];
        const definition = lockedFilters.find((filter) => filter.id === id);
        return new Intl.ListFormat(intl.locale, { type: 'unit' }).format(
            values.map((entry) => {
                if (id === 'type' && MEDIA_TYPES.includes(entry as MediaType)) {
                    return typeLabel(entry as MediaType, intl);
                }
                const option = definition?.options?.find((candidate) => candidate.value === entry);
                return option?.label ?? String(entry);
            }),
        );
    };

    return (
        <>
            <div className={styles.toolbar}>
                <TextInput
                    type="search"
                    aria-label={intl.formatMessage(messages.pickerSearch)}
                    placeholder={intl.formatMessage(messages.pickerSearchPlaceholder)}
                    prefix={<Search aria-hidden size={16} />}
                    value={query.q}
                    onChange={(q) => set({ q })}
                    className={styles.search}
                />
                {!lockedType ? (
                    <Select
                        aria-label={intl.formatMessage(messages.pickerType)}
                        isRequired
                        options={[
                            { value: 'all', label: intl.formatMessage(messages.pickerTypeAll) },
                            ...MEDIA_TYPES.map((type) => ({
                                value: type,
                                label: typeLabel(type, intl),
                            })),
                        ]}
                        value={query.type ?? 'all'}
                        onChange={(value) =>
                            set({ type: value === 'all' ? null : (value as MediaType) })
                        }
                        className={styles.select}
                    />
                ) : null}
                {sorts.length > 1 ? (
                    <Select
                        aria-label={intl.formatMessage(messages.pickerSort)}
                        isRequired
                        options={sorts.map((sort) => ({
                            value: sort.id,
                            label: sortLabel(sort, intl),
                        }))}
                        value={query.sort ?? sorts[0]?.id ?? null}
                        onChange={(value) => set({ sort: String(value) })}
                        className={styles.select}
                    />
                ) : null}
                {shown.length > 0 || lockedEntries.length > 0 ? (
                    <Button
                        icon={SlidersHorizontal}
                        aria-expanded={open}
                        onPress={() => setOpen(!open)}
                    >
                        {intl.formatMessage(messages.pickerFilters)}
                        {active > 0 ? (
                            <Badge appearance="solid" tone="accent">
                                {intl.formatNumber(active)}
                            </Badge>
                        ) : null}
                    </Button>
                ) : null}
            </div>
            {open && (shown.length > 0 || lockedEntries.length > 0) ? (
                <div className={styles.filters}>
                    {lockedEntries.map(([id, value]) => (
                        <span key={id} className={styles.lockedFilter}>
                            <Lock aria-hidden size={12} />
                            {intl.formatMessage(messages.pickerLockedFilter, {
                                label:
                                    id === 'type'
                                        ? intl.formatMessage(messages.pickerType)
                                        : (lockedFilters.find((filter) => filter.id === id)
                                              ?.label ?? id),
                                value: valueLabel(id, value),
                            })}
                        </span>
                    ))}
                    {shown.map((filter) => {
                        const label = filter.label ?? filter.id;
                        const value = query.filter[filter.id];
                        if (filter.type === 'toggle') {
                            return (
                                <Switch
                                    key={filter.id}
                                    isSelected={value === true}
                                    onChange={(selected) =>
                                        setFilter(filter.id, selected ? true : undefined)
                                    }
                                    className={styles.filter}
                                >
                                    {label}
                                </Switch>
                            );
                        }
                        if (filter.type === 'text') {
                            return (
                                <TextInput
                                    key={filter.id}
                                    aria-label={label}
                                    placeholder={label}
                                    value={typeof value === 'string' ? value : ''}
                                    onChange={(text) =>
                                        setFilter(filter.id, text === '' ? undefined : text)
                                    }
                                    className={styles.filter}
                                />
                            );
                        }
                        const options = (filter.options ?? []).map((option) => ({
                            value: option.value,
                            label: option.label,
                        }));
                        return filter.multiple === true ? (
                            <Select
                                key={filter.id}
                                aria-label={label}
                                placeholder={label}
                                multiple
                                options={options}
                                value={Array.isArray(value) ? value : []}
                                onChange={(values) =>
                                    setFilter(filter.id, values.length > 0 ? values : undefined)
                                }
                                className={styles.filter}
                            />
                        ) : (
                            <Select
                                key={filter.id}
                                aria-label={label}
                                placeholder={label}
                                options={options}
                                value={
                                    value !== undefined &&
                                    !Array.isArray(value) &&
                                    !isFilterRange(value)
                                        ? value
                                        : null
                                }
                                onChange={(selected) => setFilter(filter.id, selected ?? undefined)}
                                className={styles.filter}
                            />
                        );
                    })}
                    {active > 0 ? (
                        <Button size="sm" variant="ghost" onPress={() => set({ filter: {} })}>
                            {intl.formatMessage(messages.pickerResetFilters)}
                        </Button>
                    ) : null}
                </div>
            ) : null}
        </>
    );
}
