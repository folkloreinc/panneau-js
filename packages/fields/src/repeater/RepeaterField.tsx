import {
    ArrowDown,
    ArrowUp,
    ChevronRight,
    ChevronsDownUp,
    ChevronsUpDown,
    CircleAlert,
    Plus,
    Trash2,
} from 'lucide-react';
import { type ReactNode, useId, useState } from 'react';

import type { BlockType, Field } from '@panneau/protocol';
import {
    Button,
    Fieldset,
    Icon,
    IconButton,
    Menu,
    MenuItem,
    MenuTrigger,
    usePanneauIntl,
} from '@panneau/ui';

import { NestedField } from '../shared/DefinitionField';
import { cx } from '../shared/cx';
import { getFieldProps, getRuleNumber, getSetting, isBoolean } from '../shared/entry';
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
    /**
     * The title of an item, after its number: a summary of its values (decision 0065). Without
     * one, or when it gives `null`, the label of its type, or "Item 2".
     */
    itemTitle?: (item: RepeaterItem, index: number) => string | null;
    /**
     * Lays out the rendered fields of an item, by name, instead of one under the other: the
     * layout of a compound field (decision 0065).
     */
    renderFields?: (parts: Readonly<Record<string, ReactNode>>, item: RepeaterItem) => ReactNode;
    /**
     * Items collapse under their title (decision 0068). Items the list had when it showed start
     * collapsed, and an item that is added starts expanded. Defaults to true.
     */
    collapsible?: boolean;
    /**
     * Paths inside the list that have errors (`blocks.2.title`), from the form's binding: an
     * item with an error expands, and its header says so.
     */
    invalidPaths?: readonly string[];
    itemClassName?: string;
}

function defaults(fields: readonly Field[]): RepeaterItem {
    return Object.fromEntries(
        fields.flatMap((field) =>
            field.default !== undefined ? [[field.name, field.default]] : [],
        ),
    );
}

/** Types whose value is text that can stand for an item in its collapsed header. */
const EXCERPT_TYPES = new Set(['text', 'textarea', 'richtext', 'email', 'url']);
const ENTITIES: Readonly<Record<string, string>> = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    nbsp: ' ',
    '#39': "'",
};

/** Text without its tags, on one line: the excerpt of a rich text. */
function plainText(text: string): string {
    return text
        .replace(/<[^>]*>/g, ' ')
        .replace(/&(amp|lt|gt|quot|nbsp|#39);/g, (_, name: string) => ENTITIES[name] ?? '')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * The first text of an item, for its collapsed header: the value of its first text field that has
 * one, in the first locale that has one for a localized field.
 */
export function getItemExcerpt(item: RepeaterItem, fields: readonly Field[]): string | null {
    for (const field of fields) {
        if (!EXCERPT_TYPES.has(field.type)) {
            continue;
        }
        const value = item[field.name];
        const texts =
            typeof value === 'string'
                ? [value]
                : value !== null && typeof value === 'object' && !Array.isArray(value)
                  ? Object.values(value)
                  : [];
        for (const text of texts) {
            if (typeof text === 'string') {
                const plain = plainText(text);
                if (plain !== '') {
                    return plain.length > 140 ? `${plain.slice(0, 140)}…` : plain;
                }
            }
        }
    }
    return null;
}

/** The indexes of the items that have an error, from the paths in error inside the list. */
function invalidIndexes(base: string, paths: readonly string[]): Set<number> {
    const prefix = `${base}.`;
    const indexes = new Set<number>();
    for (const path of paths) {
        if (path.startsWith(prefix)) {
            const index = Number(path.slice(prefix.length).split('.')[0]);
            if (Number.isInteger(index)) {
                indexes.add(index);
            }
        }
    }
    return indexes;
}

/** Moves the value at `from` to `to`, as items move. */
function moved<T>(list: readonly T[], from: number, to: number): T[] {
    const next = [...list];
    const [value] = next.splice(from, 1);
    if (value !== undefined) {
        next.splice(to, 0, value);
    }
    return next;
}

/**
 * A list of items, each with the same fields, or typed blocks with the fields of their type. Items
 * can be added, moved and removed. Each field renders at the path `<list>.<index>.<field>`. An
 * empty list is `null`.
 *
 * Items collapse under their title (decision 0068): those the list had when it showed start
 * collapsed, an added item starts expanded, and an item with an error expands. The state of each
 * item stays while the list shows.
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
    itemTitle,
    renderFields,
    collapsible = true,
    invalidPaths = [],
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

    // Whether each item is expanded, by index: an item the list doesn't know yet (it had it when
    // it showed, or it came from outside, such as an undo) is collapsed. A disabled list can't be
    // expanded, so it shows its items.
    const [expanded, setExpanded] = useState<readonly boolean[]>([]);
    const isExpanded = (index: number) =>
        !collapsible || disabled === true || (expanded[index] ?? false);
    const known = (list: readonly boolean[]) => items.map((_, index) => list[index] ?? false);

    // Items that get an error expand, once: their fields show it, and the error summary can
    // focus them. The state is adjusted while rendering, when the paths in error change.
    const invalid = invalidIndexes(base, invalidPaths);
    const invalidKey = [...invalid].sort((a, b) => a - b).join(',');
    const [seenInvalid, setSeenInvalid] = useState('');
    if (invalidKey !== seenInvalid) {
        const before = new Set(seenInvalid === '' ? [] : seenInvalid.split(',').map(Number));
        setSeenInvalid(invalidKey);
        if ([...invalid].some((index) => !before.has(index))) {
            setExpanded(
                known(expanded).map(
                    (open, index) => open || (invalid.has(index) && !before.has(index)),
                ),
            );
        }
    }

    const set = (next: RepeaterItem[]) => onChange?.(next.length > 0 ? next : null);
    const move = (from: number, to: number) => {
        set(moved(items, from, to));
        setExpanded(moved(known(expanded), from, to));
    };
    const remove = (index: number) => {
        set(items.filter((_, i) => i !== index));
        setExpanded(known(expanded).filter((_, i) => i !== index));
    };
    const add = (type?: BlockType) => {
        set([
            ...items,
            type !== undefined ? { type: type.id, ...defaults(type.fields) } : defaults(fields),
        ]);
        setExpanded([...known(expanded), true]);
    };
    const toggle = (index: number) =>
        setExpanded(known(expanded).map((open, i) => (i === index ? !open : open)));
    const anyExpanded = items.some((_, index) => isExpanded(index));
    const showToggleAll = collapsible && disabled !== true && items.length > 1;

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
            {showToggleAll ? (
                <div className={styles.bar}>
                    <Button
                        size="sm"
                        appearance="ghost"
                        icon={anyExpanded ? ChevronsDownUp : ChevronsUpDown}
                        onPress={() => setExpanded(items.map(() => !anyExpanded))}
                    >
                        {intl.formatMessage(
                            anyExpanded ? messages.collapseAll : messages.expandAll,
                        )}
                    </Button>
                </div>
            ) : null}
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
                        const bodyId = `${id}-${index}-body`;
                        const summary = itemTitle?.(item, index) ?? null;
                        const open = isExpanded(index);
                        const hasError = invalid.has(index);
                        const excerpt =
                            collapsible && !open && itemTitle === undefined
                                ? getItemExcerpt(item, itemFields)
                                : null;
                        const title = (
                            <span id={titleId} className={styles.title}>
                                <span className={styles.index}>{number}</span>{' '}
                                {summary ??
                                    type?.label ??
                                    (typeof item.type === 'string'
                                        ? item.type
                                        : intl.formatMessage(messages.item, {
                                              index: number,
                                          }))}
                                {excerpt !== null ? (
                                    <>
                                        {' '}
                                        <span className={styles.excerpt}>{excerpt}</span>
                                    </>
                                ) : null}
                            </span>
                        );
                        const renderField = (field: Field) => (
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
                        );
                        return (
                            <li
                                key={index}
                                className={cx(styles.item, itemClassName)}
                                aria-labelledby={titleId}
                                data-expanded={open || undefined}
                                data-invalid={hasError || undefined}
                            >
                                <div className={styles.header}>
                                    {collapsible && disabled !== true ? (
                                        <button
                                            type="button"
                                            className={styles.toggle}
                                            aria-expanded={open}
                                            aria-controls={bodyId}
                                            onClick={() => toggle(index)}
                                        >
                                            <Icon
                                                icon={ChevronRight}
                                                size="sm"
                                                className={styles.chevron}
                                            />
                                            {title}
                                            {hasError ? (
                                                <>
                                                    {' '}
                                                    <span className={styles.error}>
                                                        <Icon icon={CircleAlert} size="sm" />
                                                        <span className={styles.visuallyHidden}>
                                                            {intl.formatMessage(
                                                                messages.itemHasErrors,
                                                            )}
                                                        </span>
                                                    </span>
                                                </>
                                            ) : null}
                                        </button>
                                    ) : (
                                        title
                                    )}
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
                                                onPress={() => remove(index)}
                                            />
                                        </span>
                                    ) : null}
                                </div>
                                {/* Hidden, not removed: the fields keep their state, such as an
                                    editor's history, while their item is collapsed. */}
                                <div id={bodyId} className={styles.body} hidden={!open}>
                                    {renderFields !== undefined
                                        ? renderFields(
                                              Object.fromEntries(
                                                  itemFields.map((field) => [
                                                      field.name,
                                                      renderField(field),
                                                  ]),
                                              ),
                                              item,
                                          )
                                        : itemFields.map(renderField)}
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
 * rules. The `collapsible` setting, `false`, keeps every item expanded (decision 0068).
 */
export function RepeaterFieldEntry(props: FieldEntryProps) {
    const { field, value } = props;
    const min = getRuleNumber(field, 'min');
    const max = getRuleNumber(field, 'max');
    const collapsible = getSetting(field, 'collapsible', isBoolean);
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
            {...(collapsible !== undefined ? { collapsible } : {})}
            {...(props.invalidPaths !== undefined ? { invalidPaths: props.invalidPaths } : {})}
        />
    );
}
