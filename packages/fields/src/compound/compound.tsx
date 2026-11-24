import type { ReactNode } from 'react';

import { getNestedShape } from '@panneau/protocol/runtime';
import { usePanneauIntl } from '@panneau/ui';

import { GroupField, type GroupValue } from '../group/GroupField';
import { RepeaterField, type RepeaterItem } from '../repeater/RepeaterField';
import { getFieldProps, getRuleNumber } from '../shared/entry';
import type { FieldEntryProps } from '../shared/types';
import { type CompoundFieldEntry, type CompoundFieldOptions, isObject } from './summary';

export {
    type CompoundFieldEntry,
    type CompoundFieldOptions,
    type CompoundLayoutProps,
    type CompoundSummary,
    type CompoundSummaryContext,
    restParts,
    summarizeCompound,
} from './summary';

/**
 * Makes the entry of a compound field type (decision 0065): a type of a plugin that carries its
 * sub-fields in `fields`. Its value is an object of them, or a list of objects with `multiple`,
 * rendered as a `group` or a `repeater` with the layout and the summary given. The definition
 * decides the sub-fields: the layout places those it knows by name. The README of
 * `@panneau/fields` has an example.
 */
export function defineCompoundField(options: CompoundFieldOptions = {}): CompoundFieldEntry {
    const { layout, summarize } = options;

    function CompoundField(props: FieldEntryProps) {
        const intl = usePanneauIntl();
        const { field, value } = props;
        const fields = field.fields ?? [];
        const context = { field, locale: intl.locale };
        const renderFields =
            layout !== undefined
                ? (parts: Readonly<Record<string, ReactNode>>, item: Record<string, unknown>) =>
                      layout({ parts, value: item, field })
                : undefined;
        if (getNestedShape(field) === 'repeater') {
            const min = getRuleNumber(field, 'min');
            const max = getRuleNumber(field, 'max');
            return (
                <RepeaterField
                    {...getFieldProps(props)}
                    path={props.path}
                    fields={fields}
                    value={Array.isArray(value) ? value.filter(isObject) : null}
                    onChange={props.onChange}
                    {...(renderFields !== undefined ? { renderFields } : {})}
                    {...(summarize !== undefined
                        ? { itemTitle: (item: RepeaterItem) => summarize(item, context) }
                        : {})}
                    {...(min !== undefined ? { min } : {})}
                    {...(max !== undefined ? { max } : {})}
                    {...(props.invalidPaths !== undefined
                        ? { invalidPaths: props.invalidPaths }
                        : {})}
                />
            );
        }
        return (
            <GroupField
                {...getFieldProps(props)}
                fields={fields}
                path={props.path}
                value={isObject(value) ? (value as GroupValue) : null}
                onChange={props.onChange}
                {...(renderFields !== undefined ? { renderFields } : {})}
            />
        );
    }

    return Object.assign(CompoundField, summarize !== undefined ? { summarize } : {});
}
