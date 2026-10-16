import type { IntlShape } from 'react-intl';

import type { Field, Filter, Option } from '@panneau/protocol';
import { isFilterRange } from '@panneau/protocol/runtime';

import { messages } from '../messages';
import type { ListColumn } from '../types';
import { getFieldOptions, getOptionLabel } from '../values';

/** The label of a filter: its `label`, the label of its field, or its id. */
export function getFilterLabel(
    filter: Filter,
    columns: readonly ListColumn[],
    fields: readonly Field[],
): string {
    if (filter.label !== undefined) {
        return filter.label;
    }
    const field = findFilterField(filter, columns, fields);
    return field?.label ?? filter.id;
}

/** The field a filter filters, when a column or the list's fields have one with its id. */
export function findFilterField(
    filter: Filter,
    columns: readonly ListColumn[],
    fields: readonly Field[],
): Field | null {
    return (
        fields.find((field) => field.name === filter.id) ??
        columns.find((column) => column.field?.name === filter.id)?.field ??
        null
    );
}

/** The options of a filter: its own, or those of the field it filters. */
export function getFilterOptions(
    filter: Filter,
    columns: readonly ListColumn[],
    fields: readonly Field[],
): readonly Option[] {
    return filter.options ?? getFieldOptions(findFilterField(filter, columns, fields));
}

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

function formatDay(value: string, intl: IntlShape): string {
    const match = DATE_ONLY.exec(value);
    if (match === null) {
        return value;
    }
    return intl.formatDate(new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])), {
        dateStyle: 'medium',
    });
}

/** The value of an active filter, as the text of its chip. */
export function formatFilterValue(
    filter: Filter,
    value: unknown,
    {
        intl,
        options,
        getValueLabel,
    }: {
        intl: IntlShape;
        options: readonly Option[];
        getValueLabel: (value: string) => string | null;
    },
): string {
    const values: unknown[] = Array.isArray(value) ? value : [value];
    switch (filter.type) {
        case 'toggle':
            return intl.formatMessage(String(value) === 'true' ? messages.yes : messages.no);
        case 'date':
            return formatDay(String(value), intl);
        case 'date-range': {
            const range = isFilterRange(value) ? value : {};
            const from = range.from !== undefined ? String(range.from) : '';
            const to = range.to !== undefined ? String(range.to) : '';
            return intl.formatMessage(messages.dateRange, {
                from: from !== '' ? formatDay(from, intl) : '…',
                to: to !== '' ? formatDay(to, intl) : '…',
            });
        }
        case 'relation':
            return values.map((entry) => getValueLabel(String(entry)) ?? String(entry)).join(', ');
        default:
            return values
                .map((entry) => getOptionLabel(options, entry) ?? String(entry))
                .join(', ');
    }
}
