import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { useId } from 'react';

import type { BlockType, Field } from '@panneau/protocol';
import {
    Button,
    Fieldset,
    IconButton,
    Menu,
    MenuItem,
    MenuTrigger,
    usePanneauIntl,
} from '@panneau/ui';

import { NestedField } from '../shared/DefinitionField';
import { cx } from '../shared/cx';
import { getFieldProps, getRuleNumber } from '../shared/entry';
import { messages } from '../shared/messages';
import type { FieldEntryProps, FieldProps } from '../shared/types';
import styles from './RepeaterField.module.css';

/** An item of a repeater. Typed blocks have their type in `type`. */
export type RepeaterItem = Record<string, unknown>;

export interface RepeaterFieldProps extends FieldProps<RepeaterItem[]> {
    /** The fields of each item. */
    fields?: readonly Field[];
    /** Typed blocks: each item has a `type`, and the fields of that type. */
    types?: readonly BlockType[];
    /** Dot path of the list, the prefix of its fields' paths (`blocks.2.body`). Defaults to `name`. */
    path?: string;
    /** Fewest items: items can't be removed below it. */
    min?: number;
    /** Most items: no item can be added above it. */
    max?: number;
    itemClassName?: string;
}

function defaults(fields: readonly Field[]): RepeaterItem {
    return Object.fromEntries(
        fields.flatMap((field) =>
            field.default !== undefined ? [[field.name, field.default]] : [],
        ),
    );
}

/**
 * A list of items, each with the same fields, or typed blocks with the fields of their type. Items
 * can be added, moved and removed. Each field renders at the path `<list>.<index>.<field>`. An
 * empty list is `null`.
 */
export function RepeaterField({
    fields = [],
    types,
    path,
    name,
    value,
    onChange,
    onBlur,
    label,
    description,
    errors,
    disabled,
    readOnly,
    required,
    min = 0,
    max,
    className,
    labelClassName,
    descriptionClassName,
    errorsClassName,
    itemClassName,
}: RepeaterFieldProps) {
    const intl = usePanneauIntl();
    const id = useId();
    const base = path ?? name ?? '';
    const items = value ?? [];
    const editable = disabled !== true && readOnly !== true;
    const canAdd = editable && (max === undefined || items.length < max);
    const canRemove = editable && items.length > min;
    const set = (next: RepeaterItem[]) => onChange?.(next.length > 0 ? next : null);
    const move = (from: number, to: number) => {
        const next = [...items];
        const [moved] = next.splice(from, 1);
        if (moved !== undefined) {
            next.splice(to, 0, moved);
            set(next);
        }
    };
    const add = (type?: BlockType) =>
        set([
            ...items,
            type !== undefined ? { type: type.id, ...defaults(type.fields) } : defaults(fields),
        ]);

    return (
        <Fieldset
            legend={label}
            description={description}
            errors={errors}
            isRequired={required}
            className={className}
            legendClassName={labelClassName}
            descriptionClassName={descriptionClassName}
            errorsClassName={errorsClassName}
        >
            {items.length > 0 ? (
                <ol className={styles.items}>
                    {items.map((item, index) => {
                        const type =
                            types !== undefined
                                ? types.find((candidate) => candidate.id === item.type)
                                : undefined;
                        const itemFields = types !== undefined ? (type?.fields ?? []) : fields;
                        const number = index + 1;
                        const titleId = `${id}-${index}`;
                        return (
                            <li
                                key={index}
                                className={cx(styles.item, itemClassName)}
                                aria-labelledby={titleId}
                            >
                                <div className={styles.header}>
                                    <span id={titleId} className={styles.title}>
                                        <span className={styles.index}>{number}</span>
                                        {type?.label ??
                                            (typeof item.type === 'string'
                                                ? item.type
                                                : intl.formatMessage(messages.item, {
                                                      index: number,
                                                  }))}
                                    </span>
                                    {editable ? (
                                        <span className={styles.tools}>
                                            <IconButton
                                                icon={ArrowUp}
                                                size="sm"
                                                label={intl.formatMessage(messages.moveUp, {
                                                    index: number,
                                                })}
                                                isDisabled={index === 0}
                                                onPress={() => move(index, index - 1)}
                                            />
                                            <IconButton
                                                icon={ArrowDown}
                                                size="sm"
                                                label={intl.formatMessage(messages.moveDown, {
                                                    index: number,
                                                })}
                                                isDisabled={index === items.length - 1}
                                                onPress={() => move(index, index + 1)}
                                            />
                                            <IconButton
                                                icon={Trash2}
                                                size="sm"
                                                label={intl.formatMessage(messages.removeItem, {
                                                    index: number,
                                                })}
                                                isDisabled={!canRemove}
                                                onPress={() =>
                                                    set(items.filter((_, i) => i !== index))
                                                }
                                            />
                                        </span>
                                    ) : null}
                                </div>
                                <div className={styles.body}>
                                    {itemFields.map((field) => (
                                        <NestedField
                                            key={field.name}
                                            field={field}
                                            path={`${base}.${index}.${field.name}`}
                                            value={item[field.name]}
                                            onChange={(next) =>
                                                set(
                                                    items.map((current, i) =>
                                                        i === index
                                                            ? { ...current, [field.name]: next }
                                                            : current,
                                                    ),
                                                )
                                            }
                                            {...(onBlur !== undefined ? { onBlur } : {})}
                                            parentValue={item}
                                            {...(disabled !== undefined ? { disabled } : {})}
                                            {...(readOnly !== undefined ? { readOnly } : {})}
                                        />
                                    ))}
                                </div>
                            </li>
                        );
                    })}
                </ol>
            ) : (
                <p className={styles.empty}>{intl.formatMessage(messages.noItems)}</p>
            )}
            {editable ? (
                <div className={styles.footer}>
                    {types !== undefined ? (
                        <MenuTrigger>
                            <Button size="sm" icon={Plus} isDisabled={!canAdd}>
                                {intl.formatMessage(messages.add)}
                            </Button>
                            <Menu
                                aria-label={intl.formatMessage(messages.add)}
                                onAction={(key) => add(types.find((type) => type.id === key))}
                            >
                                {types.map((type) => (
                                    <MenuItem key={type.id} id={type.id}>
                                        {type.label}
                                    </MenuItem>
                                ))}
                            </Menu>
                        </MenuTrigger>
                    ) : (
                        <Button size="sm" icon={Plus} isDisabled={!canAdd} onPress={() => add()}>
                            {intl.formatMessage(messages.add)}
                        </Button>
                    )}
                </div>
            ) : null}
        </Fieldset>
    );
}

/**
 * The `repeater` type: `fields`, or `types` for typed blocks, with `min` and `max` items from its
 * rules.
 */
export function RepeaterFieldEntry(props: FieldEntryProps) {
    const { field, value } = props;
    const min = getRuleNumber(field, 'min');
    const max = getRuleNumber(field, 'max');
    return (
        <RepeaterField
            {...getFieldProps(props)}
            path={props.path}
            {...(field.types !== undefined
                ? { types: field.types }
                : { fields: field.fields ?? [] })}
            value={
                Array.isArray(value)
                    ? value.filter(
                          (item): item is RepeaterItem =>
                              item !== null && typeof item === 'object' && !Array.isArray(item),
                      )
                    : null
            }
            onChange={props.onChange}
            {...(min !== undefined ? { min } : {})}
            {...(max !== undefined ? { max } : {})}
        />
    );
}
