import { useEffect } from 'react';

import { useFieldsContext } from '@panneau/fields';
import { DateField } from '@panneau/fields/date';
import { RelationField, useRelationReferences } from '@panneau/fields/relation';
import type { FilterValue } from '@panneau/protocol';
import { isFilterRange } from '@panneau/protocol/runtime';
import { Fieldset, type OptionValue, Select, Switch, TextInput, usePanneauIntl } from '@panneau/ui';

import { messages } from '../messages';
import type { FilterControlProps, FilterEntry } from '../types';
import { useDraft } from '../useDraft';
import styles from './Filters.module.css';

function asStrings(value: unknown): string[] {
    if (isFilterRange(value)) {
        return [];
    }
    if (Array.isArray(value)) {
        return value.map(String);
    }
    return value === undefined || value === null || value === '' ? [] : [String(value)];
}

/** A text filter: the list changes once the user stops typing. */
export function TextFilter({ label, value, onChange }: FilterControlProps) {
    const current = typeof value === 'string' || typeof value === 'number' ? String(value) : '';
    const { draft, setDraft, flush } = useDraft(current, (next) =>
        onChange(next !== '' ? next : undefined),
    );
    return (
        <TextInput
            label={label}
            value={draft}
            onChange={setDraft}
            onKeyDown={(event) => {
                if (event.key === 'Enter') {
                    flush();
                }
            }}
            onBlur={flush}
            className={styles.control}
        />
    );
}

/** A choice among the options, or several with `multiple`. */
export function SelectFilter({ filter, label, options, value, onChange }: FilterControlProps) {
    const intl = usePanneauIntl();
    const selected = asStrings(value);
    // Values from the URL are strings: match them to the options' values.
    const toOptions = (values: readonly string[]): OptionValue[] =>
        options
            .filter((option) => values.includes(String(option.value)))
            .map((option) => option.value);
    const placeholder = intl.formatMessage(messages.any);
    if (filter.multiple === true) {
        return (
            <Select
                multiple
                label={label}
                options={options}
                placeholder={placeholder}
                value={toOptions(selected)}
                onChange={(next) => onChange(next.length > 0 ? next : undefined)}
                className={styles.control}
            />
        );
    }
    return (
        <Select
            label={label}
            options={options}
            placeholder={placeholder}
            value={toOptions(selected)[0] ?? null}
            onChange={(next) => onChange(next ?? undefined)}
            className={styles.control}
        />
    );
}

/** On or off: on filters with `true`, off removes the filter. */
export function ToggleFilter({ label, value, onChange }: FilterControlProps) {
    return (
        <Switch
            isSelected={String(value) === 'true'}
            onChange={(checked) => onChange(checked ? true : undefined)}
            className={styles.toggle}
        >
            {label}
        </Switch>
    );
}

/** A day (`2026-10-15`). */
export function DateFilter({ label, value, onChange }: FilterControlProps) {
    return (
        <DateField
            label={label}
            value={typeof value === 'string' && value !== '' ? value : null}
            onChange={(next) => onChange(next ?? undefined)}
            className={styles.control}
        />
    );
}

/**
 * A range of days, sent as its bounds (`filter[published_at][from]=2026-01-01&…[to]=…`). Either end
 * can be open: it is left out.
 */
export function DateRangeFilter({ label, value, onChange }: FilterControlProps) {
    const intl = usePanneauIntl();
    const range = isFilterRange(value) ? value : {};
    const from = range.from !== undefined ? String(range.from) : '';
    const to = range.to !== undefined ? String(range.to) : '';
    const set = (nextFrom: string, nextTo: string) =>
        onChange(
            nextFrom === '' && nextTo === ''
                ? undefined
                : {
                      ...(nextFrom !== '' ? { from: nextFrom } : {}),
                      ...(nextTo !== '' ? { to: nextTo } : {}),
                  },
        );
    return (
        <Fieldset legend={label} className={styles.range}>
            <DateField
                label={intl.formatMessage(messages.from)}
                value={from !== '' ? from : null}
                onChange={(next) => set(next ?? '', to)}
            />
            <DateField
                label={intl.formatMessage(messages.to)}
                value={to !== '' ? to : null}
                onChange={(next) => set(from, next ?? '')}
            />
        </Fieldset>
    );
}

/**
 * An item of another resource (`resource`), or several with `multiple`, picked with the relation
 * source of the fields context. The filter keeps their ids; their labels are remembered for the
 * chips.
 */
export function RelationFilter({
    filter,
    label,
    value,
    onChange,
    onLabel,
    getValueLabel,
}: FilterControlProps) {
    const resource = filter.resource ?? filter.id;
    // Ids from the URL have no label: the relation source resolves them, for the picker and chips.
    const references = useRelationReferences(
        useFieldsContext().relationSource,
        resource,
        asStrings(value).map((id) => ({ id, label: getValueLabel(id) ?? id })),
    );
    const remember = (next: readonly { id: string; label: string }[]) =>
        next.forEach((reference) => onLabel(reference.id, reference.label));
    useEffect(() => {
        references
            .filter((reference) => reference.label !== reference.id)
            .forEach((reference) => onLabel(reference.id, reference.label));
    }, [references, onLabel]);
    if (filter.multiple === true) {
        return (
            <RelationField
                multiple
                label={label}
                resource={resource}
                value={references}
                onChange={(next) => {
                    remember(next ?? []);
                    const ids: FilterValue | undefined =
                        next !== null && next.length > 0
                            ? next.map((reference) => reference.id)
                            : undefined;
                    onChange(ids);
                }}
                className={styles.control}
            />
        );
    }
    return (
        <RelationField
            label={label}
            resource={resource}
            value={references[0] ?? null}
            onChange={(next) => {
                remember(next !== null ? [next] : []);
                onChange(next?.id);
            }}
            className={styles.control}
        />
    );
}

/** The built-in filter controls, by filter type. Unknown types are text filters. */
export const builtInFilters: Readonly<Record<string, FilterEntry>> = {
    text: TextFilter,
    select: SelectFilter,
    toggle: ToggleFilter,
    date: DateFilter,
    'date-range': DateRangeFilter,
    relation: RelationFilter,
};
