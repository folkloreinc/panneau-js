import {
    ArrowDown,
    ArrowUp,
    ChevronRight,
    ChevronsDownUp,
    ChevronsUpDown,
    CircleAlert,
    Copy,
    Ellipsis,
    Plus,
    Trash2,
} from 'lucide-react';
import { type ReactNode, useEffect, useId, useRef, useState } from 'react';

import type { BlockType, Field } from '@panneau/protocol';
import {
    Button,
    Fieldset,
    Icon,
    IconButton,
    Menu,
    MenuItem,
    MenuTrigger,
    ReorderHandle,
    ReorderItem,
    ReorderList,
    getNamedIcon,
    moveItem,
    useActionsFit,
    usePanneauIntl,
    useUndoToast,
} from '@panneau/ui';

import { NestedField } from '../shared/DefinitionField';
import { cx } from '../shared/cx';
import { getFieldProps, getRuleNumber, getSetting, isBoolean, isString } from '../shared/entry';
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

/** A text cut at 140 characters, for a header. */
const cut = (text: string) => (text.length > 140 ? `${text.slice(0, 140)}…` : text);

/**
 * A value of an item as text, without tags: a number, the label of a choice, a text, or a
 * localized text in the locale of the interface, its language, or the first one that has a text.
 * `null` when it has none.
 */
function valueText(value: unknown, field?: Field, locale = ''): string | null {
    if (typeof value === 'number') {
        return String(value);
    }
    const texts =
        typeof value === 'string'
            ? [field?.options?.find((option) => option.value === value)?.label ?? value]
            : value !== null && typeof value === 'object' && !Array.isArray(value)
              ? [
                    (value as Record<string, unknown>)[locale],
                    (value as Record<string, unknown>)[locale.split('-')[0] ?? locale],
                    ...Object.values(value),
                ]
              : [];
    for (const text of texts) {
        const plain = typeof text === 'string' ? plainText(text) : '';
        if (plain !== '') {
            return plain;
        }
    }
    return null;
}

/**
 * The first text of an item, for its collapsed header: the value of its first text field that has
 * one, in the first locale that has one for a localized field.
 */
export function getItemExcerpt(item: RepeaterItem, fields: readonly Field[]): string | null {
    for (const field of fields) {
        const text = EXCERPT_TYPES.has(field.type) ? valueText(item[field.name]) : null;
        if (text !== null) {
            return cut(text);
        }
    }
    return null;
}

/**
 * The title of an item from the definition (`settings.itemTitle` of a repeater, or `itemTitle` of a
 * block type): a field name (`title`), or a template of field names in braces (`{first} {last}`).
 * Gives `null` when none of the fields it names has a value.
 */
export function getItemTitle(
    item: RepeaterItem,
    template: string,
    fields: readonly Field[] = [],
    locale = 'en',
): string | null {
    const pattern = template.includes('{') ? template : `{${template}}`;
    let found = false;
    const title = pattern
        .replace(/\{([^{}]+)\}/g, (_, name: string) => {
            const key = name.trim();
            const text = valueText(
                item[key],
                fields.find((field) => field.name === key),
                locale,
            );
            found = found || text !== null;
            return text ?? '';
        })
        // Brackets left empty by a missing value
        .replace(/\(\s*\)|\[\s*\]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    return found && title !== '' ? cut(title) : null;
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

/**
 * The keys of the items of a list: a stable identity for each one, which isn't part of its value,
 * so that the state of its fields (an editor's history), whether it is expanded and the focus
 * follow it when it moves.
 */
export interface ItemKeys {
    /** The items the keys were given to. */
    items: readonly RepeaterItem[];
    keys: readonly number[];
    /** The next key to give. */
    next: number;
}

/** Keys for the items a list shows first. */
export function initialItemKeys(items: readonly RepeaterItem[]): ItemKeys {
    return { items, keys: items.map((_, index) => index), next: items.length };
}

/**
 * Keys for the items of a new value, from those of the previous one. An item keeps its key when it
 * is the same object, wherever it moved; an item that changed (a new object at the same place, as
 * a form writes an edit) keeps the key of its place, when no other item took it. Other items get
 * new keys. Returns `previous` itself when the items didn't change.
 */
export function updateItemKeys(previous: ItemKeys, items: readonly RepeaterItem[]): ItemKeys {
    if (
        items.length === previous.items.length &&
        items.every((item, index) => item === previous.items[index])
    ) {
        return previous;
    }
    const used = new Set<number>();
    const found = items.map((item) => {
        const at = previous.items.findIndex(
            (candidate, index) =>
                candidate === item && !used.has(previous.keys[index] ?? Number.NaN),
        );
        const key = at !== -1 ? previous.keys[at] : undefined;
        if (key !== undefined) {
            used.add(key);
        }
        return key;
    });
    let next = previous.next;
    const keys = found.map((key, index) => {
        if (key !== undefined) {
            return key;
        }
        const own = previous.keys[index];
        if (own !== undefined && !used.has(own)) {
            used.add(own);
            return own;
        }
        next += 1;
        return next - 1;
    });
    return { items, keys, next };
}

interface ItemToolsProps {
    index: number;
    count: number;
    canAdd: boolean;
    canRemove: boolean;
    onMove: (to: number) => void;
    onDuplicate: () => void;
    onRemove: () => void;
}

/**
 * The tools of an item, in its header: move it up or down, duplicate it, remove it. Buttons while
 * they fit next to its title, a "⋯" menu when they don't (`useActionsFit`, decision 0114).
 */
function ItemTools({
    index,
    count,
    canAdd,
    canRemove,
    onMove,
    onDuplicate,
    onRemove,
}: ItemToolsProps) {
    const intl = usePanneauIntl();
    const { inline, ref: holdButtons, className: measured } = useActionsFit();
    const number = index + 1;
    const tools = [
        {
            id: 'up',
            icon: ArrowUp,
            label: intl.formatMessage(messages.moveUp, { index: number }),
            isDisabled: index === 0,
            onPress: () => onMove(index - 1),
        },
        {
            id: 'down',
            icon: ArrowDown,
            label: intl.formatMessage(messages.moveDown, { index: number }),
            isDisabled: index === count - 1,
            onPress: () => onMove(index + 1),
        },
        {
            id: 'duplicate',
            icon: Copy,
            label: intl.formatMessage(messages.duplicateItem, { index: number }),
            isDisabled: !canAdd,
            onPress: onDuplicate,
        },
        {
            id: 'remove',
            icon: Trash2,
            label: intl.formatMessage(messages.removeItem, { index: number }),
            isDisabled: !canRemove,
            onPress: onRemove,
        },
    ];
    return (
        <>
            <span
                ref={holdButtons}
                className={cx(styles.tools, measured)}
                data-tools
                data-actions-inline
            >
                {tools.map((tool) => (
                    <IconButton
                        key={tool.id}
                        icon={tool.icon}
                        size="sm"
                        label={tool.label}
                        isDisabled={tool.isDisabled}
                        onPress={tool.onPress}
                    />
                ))}
            </span>
            {inline ? null : (
                <MenuTrigger>
                    <IconButton
                        icon={Ellipsis}
                        size="sm"
                        label={intl.formatMessage(messages.itemActions, { index: number })}
                        data-actions-menu
                    />
                    <Menu
                        placement="bottom end"
                        disabledKeys={tools
                            .filter((tool) => tool.isDisabled)
                            .map((tool) => tool.id)}
                        onAction={(key) => tools.find((tool) => tool.id === key)?.onPress()}
                    >
                        {tools.map((tool) => (
                            <MenuItem
                                key={tool.id}
                                id={tool.id}
                                icon={tool.icon}
                                isDanger={tool.id === 'remove'}
                            >
                                {tool.label}
                            </MenuItem>
                        ))}
                    </Menu>
                </MenuTrigger>
            )}
        </>
    );
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
    const undoToast = useUndoToast();
    const id = useId();
    const base = path ?? name ?? '';
    const items = value ?? [];
    const editable = disabled !== true && readOnly !== true;
    const canAdd = editable && (max === undefined || items.length < max);
    const canRemove = editable && items.length > min;

    // A stable key for each item, adjusted while rendering when the value changes
    const [itemKeys, setItemKeys] = useState(() => initialItemKeys(items));
    const tracked = updateItemKeys(itemKeys, items);
    if (tracked !== itemKeys) {
        setItemKeys(tracked);
    }
    const { keys } = tracked;
    const keyAt = (index: number) => keys[index] ?? -1;

    // The latest value, for an undo that comes after other changes
    const latest = useRef({ items, tracked, onChange });
    useEffect(() => {
        latest.current = { items, tracked, onChange };
    });

    // Where the focus goes once the list changed: a button of an item that moved, or the header
    // of an item put back. The item may only show once its value comes back from the form.
    const list = useRef<HTMLElement>(null);
    const focusNext = useRef<{
        key: number;
        index: number;
        tool: 'up' | 'down' | 'header';
    } | null>(null);
    useEffect(() => {
        const target = focusNext.current;
        // Once the item shows at its new place
        const item =
            target !== null && keys[target.index] === target.key
                ? list.current?.querySelector(`[data-key="${target.key}"]`)
                : null;
        if (target === null || item === null || item === undefined) {
            return;
        }
        focusNext.current = null;
        // The toggle of an item put back, or its first button when it doesn't collapse
        const element =
            target.tool === 'header'
                ? item.querySelector<HTMLElement>('[data-header] button')
                : item.querySelectorAll<HTMLElement>('[data-tools] button')[
                      target.tool === 'up' ? 0 : 1
                  ];
        element?.focus();
    });

    // The keys of the expanded items: an item the list doesn't know yet (it had it when it
    // showed, or it came from outside) is collapsed. A disabled list can't be expanded, so it
    // shows its items.
    const [expanded, setExpanded] = useState<ReadonlySet<number>>(() => new Set());
    const isExpanded = (index: number) =>
        !collapsible || disabled === true || expanded.has(keyAt(index));

    // Items that get an error expand, once: their fields show it, and the error summary can
    // focus them. The state is adjusted while rendering, when the paths in error change.
    // By the keys of the items: an item that moves with an error doesn't expand again.
    const invalid = invalidIndexes(base, invalidPaths);
    const invalidKey = [...invalid]
        .map(keyAt)
        .sort((a, b) => a - b)
        .join(',');
    const [seenInvalid, setSeenInvalid] = useState('');
    if (invalidKey !== seenInvalid) {
        const before = new Set(seenInvalid === '' ? [] : seenInvalid.split(',').map(Number));
        setSeenInvalid(invalidKey);
        const opened = [...invalid].map(keyAt).filter((key) => !before.has(key));
        if (opened.length > 0) {
            setExpanded(new Set([...expanded, ...opened]));
        }
    }

    /** Sets the items, with their keys. */
    const set = (next: RepeaterItem[], nextKeys: readonly number[], nextKey?: number) => {
        setItemKeys({ items: next, keys: nextKeys, next: nextKey ?? tracked.next });
        onChange?.(next.length > 0 ? next : null);
    };
    const move = (from: number, to: number) => {
        set(moveItem(items, from, to), moveItem(keys, from, to));
        // The focus follows the item, on the button that moved it, or on the other one at an end
        const tool = from < to ? 'down' : 'up';
        focusNext.current = {
            key: keyAt(from),
            index: to,
            tool: to === 0 ? 'down' : to === items.length - 1 ? 'up' : tool,
        };
    };
    const titleOf = (item: RepeaterItem, index: number) => {
        const type =
            types !== undefined ? types.find((candidate) => candidate.id === item.type) : undefined;
        return (
            itemTitle?.(item, index) ??
            type?.label ??
            (typeof item.type === 'string'
                ? item.type
                : intl.formatMessage(messages.item, { index: index + 1 }))
        );
    };
    /**
     * The name of an item for its handle, the places it can go and the announcement of a move: its
     * title, with its number when it has a title of its own, as blocks of a type have.
     */
    const nameOf = (index: number) => {
        const item = items[index];
        const generic = intl.formatMessage(messages.item, { index: index + 1 });
        const title = item !== undefined ? titleOf(item, index) : generic;
        return title === generic
            ? title
            : intl.formatMessage(messages.namedItem, { name: title, index: index + 1 });
    };
    const remove = (index: number) => {
        const item = items[index];
        const key = keyAt(index);
        const following = keys[index + 1];
        if (item === undefined) {
            return;
        }
        set(
            items.filter((_, i) => i !== index),
            keys.filter((_, i) => i !== index),
        );
        const name = titleOf(item, index);
        undoToast?.(
            {
                title: intl.formatMessage(messages.removed, { name }),
                undoneTitle: intl.formatMessage(messages.restored, { name }),
                // Back at its place, with its value, its key and so its state
                onUndo: () => {
                    const current = latest.current;
                    if (current.tracked.keys.includes(key)) {
                        return;
                    }
                    // Before the item that followed it, or at its index
                    const before =
                        following !== undefined ? current.tracked.keys.indexOf(following) : -1;
                    const at = before !== -1 ? before : Math.min(index, current.items.length);
                    const next = current.items.toSpliced(at, 0, item);
                    setItemKeys({
                        items: next,
                        keys: current.tracked.keys.toSpliced(at, 0, key),
                        next: current.tracked.next,
                    });
                    current.onChange?.(next);
                    focusNext.current = { key, index: at, tool: 'header' };
                },
            },
            { key: `${id}-${key}` },
        );
    };
    /**
     * Adds an item at `at`, the end by default, with its key, expanded. An item added between
     * others, or a copy, gets the focus on its header.
     */
    const addAt = (item: RepeaterItem, position?: number) => {
        const at = position ?? items.length;
        const key = tracked.next;
        set(items.toSpliced(at, 0, item), keys.toSpliced(at, 0, key), key + 1);
        setExpanded(new Set([...expanded, key]));
        if (at < items.length) {
            focusNext.current = { key, index: at, tool: 'header' };
        }
    };
    const add = (type?: BlockType, at?: number) =>
        addAt(
            type !== undefined ? { type: type.id, ...defaults(type.fields) } : defaults(fields),
            at,
        );
    /** A copy of an item, right after it: its own values, which the original doesn't share. */
    const duplicate = (index: number) => {
        const item = items[index];
        if (item !== undefined) {
            addAt(structuredClone(item), index + 1);
        }
    };
    // Icons before the types in the menu, from their names: a type without one keeps its place
    const typesHaveIcons = types?.some((type) => type.icon !== undefined) ?? false;
    /** The menu of block types, which adds a block at `at`, or at the end. */
    const typeMenu = (at?: number) =>
        types !== undefined ? (
            <Menu
                aria-label={intl.formatMessage(messages.add)}
                onAction={(key) => {
                    const type = types.find((candidate) => candidate.id === key);
                    if (type !== undefined) {
                        add(type, at);
                    }
                }}
            >
                {types.map((type) => (
                    <MenuItem
                        key={type.id}
                        id={type.id}
                        textValue={type.label}
                        media={
                            typesHaveIcons ? (
                                <span className={styles.typeIcon}>
                                    {type.icon !== undefined ? (
                                        <Icon icon={getNamedIcon(type.icon)} />
                                    ) : null}
                                </span>
                            ) : undefined
                        }
                        {...(type.description !== undefined
                            ? { description: type.description }
                            : {})}
                    >
                        {type.label}
                    </MenuItem>
                ))}
            </Menu>
        ) : null;
    const toggle = (index: number) => {
        const key = keyAt(index);
        const next = new Set(expanded);
        if (next.has(key)) {
            next.delete(key);
        } else {
            next.add(key);
        }
        setExpanded(next);
    };
    const anyExpanded = items.some((_, index) => isExpanded(index));
    const showToggleAll = collapsible && disabled !== true && items.length > 1;

    // On the line of the legend, as its end: in a narrow field (a phone), only its icon, whose
    // label stays its accessible name, so that the legend keeps one line (#503).
    const toggleAll = showToggleAll ? (
        <Button
            size="sm"
            appearance="ghost"
            icon={anyExpanded ? ChevronsDownUp : ChevronsUpDown}
            className={styles.toggleAll}
            onPress={() => setExpanded(new Set(anyExpanded ? [] : keys))}
        >
            <span className={styles.toggleAllLabel}>
                {intl.formatMessage(anyExpanded ? messages.collapseAll : messages.expandAll)}
            </span>
        </Button>
    ) : undefined;

    return (
        <Fieldset
            legend={label}
            legendEnd={toggleAll}
            description={description}
            errors={errors}
            isRequired={required}
            className={className}
            legendClassName={labelClassName}
            descriptionClassName={descriptionClassName}
            errorsClassName={errorsClassName}
        >
            {items.length > 0 ? (
                // The handle drags an item, and the keyboard through it (decision 0111): its state
                // follows it, by its key. The buttons that move it stay in its tools.
                <ReorderList
                    ref={list}
                    elementType="ol"
                    className={styles.items}
                    itemCount={items.length}
                    itemLabel={nameOf}
                    onMove={(from, to) => set(moveItem(items, from, to), moveItem(keys, from, to))}
                    isDisabled={!editable}
                >
                    {items.map((item, index) => {
                        const type =
                            types !== undefined
                                ? types.find((candidate) => candidate.id === item.type)
                                : undefined;
                        const itemFields = types !== undefined ? (type?.fields ?? []) : fields;
                        const number = index + 1;
                        const key = keyAt(index);
                        const titleId = `${id}-${key}`;
                        // A menu of types opens from it, or it adds an item there
                        const insertButton = (
                            <IconButton
                                icon={Plus}
                                size="sm"
                                appearance="outline"
                                className={styles.insertButton}
                                label={intl.formatMessage(messages.insertItem, {
                                    before: index,
                                    after: number,
                                })}
                                {...(types === undefined
                                    ? { onPress: () => add(undefined, index) }
                                    : {})}
                            />
                        );
                        const bodyId = `${id}-${key}-body`;
                        const open = isExpanded(index);
                        const hasError = invalid.has(index);
                        // Without a title of its own, a collapsed item shows its first text
                        const ownTitle = itemTitle?.(item, index) ?? null;
                        const excerpt =
                            collapsible && !open && ownTitle === null
                                ? getItemExcerpt(item, itemFields)
                                : null;
                        const title = (
                            <span id={titleId} className={styles.title}>
                                <span className={styles.index}>{number}</span>{' '}
                                {titleOf(item, index)}
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
                                        keys,
                                    )
                                }
                                {...(onBlur !== undefined ? { onBlur } : {})}
                                parentValue={item}
                                {...(disabled !== undefined ? { disabled } : {})}
                                {...(readOnly !== undefined ? { readOnly } : {})}
                            />
                        );
                        return (
                            <ReorderItem
                                // A stable key: the state of its fields follows the item
                                key={key}
                                id={key}
                                index={index}
                                data-key={key}
                                className={cx(styles.item, itemClassName)}
                                aria-labelledby={titleId}
                                data-expanded={open || undefined}
                                data-invalid={hasError || undefined}
                            >
                                {/* Adds an item between this one and the one before it: shows
                                    on hover and focus (decision 0109) */}
                                {canAdd && index > 0 ? (
                                    <div className={styles.insert} data-insert>
                                        {types !== undefined ? (
                                            <MenuTrigger>
                                                {insertButton}
                                                {typeMenu(index)}
                                            </MenuTrigger>
                                        ) : (
                                            insertButton
                                        )}
                                    </div>
                                ) : null}
                                {/* The header follows the pointer while the item is dragged */}
                                <div className={styles.header} data-header data-reorder-preview>
                                    {editable ? <ReorderHandle className={styles.handle} /> : null}
                                    {collapsible && disabled !== true ? (
                                        <button
                                            type="button"
                                            className={styles.toggle}
                                            data-actions-title
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
                                        <span className={styles.heading} data-actions-title>
                                            {title}
                                        </span>
                                    )}
                                    {editable ? (
                                        <ItemTools
                                            index={index}
                                            count={items.length}
                                            canAdd={canAdd}
                                            canRemove={canRemove}
                                            onMove={(to) => move(index, to)}
                                            onDuplicate={() => duplicate(index)}
                                            onRemove={() => remove(index)}
                                        />
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
                            </ReorderItem>
                        );
                    })}
                </ReorderList>
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
                            {typeMenu()}
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
 * rules. The `collapsible` setting, `false`, keeps every item expanded (decision 0068). The
 * `itemTitle` setting, or the `itemTitle` of a block type, titles each item from its values.
 */
export function RepeaterFieldEntry(props: FieldEntryProps) {
    const { field, value } = props;
    const intl = usePanneauIntl();
    const min = getRuleNumber(field, 'min');
    const max = getRuleNumber(field, 'max');
    const collapsible = getSetting(field, 'collapsible', isBoolean);
    const titleSetting = getSetting(field, 'itemTitle', isString);
    // The title of an item from the definition, or none: its type, or "Item 2", and its excerpt
    const itemTitle = (item: RepeaterItem) => {
        const type = field.types?.find((candidate) => candidate.id === item.type);
        const template = type?.itemTitle ?? titleSetting;
        return template
            ? getItemTitle(item, template, type?.fields ?? field.fields, intl.locale)
            : null;
    };
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
            itemTitle={itemTitle}
            {...(props.invalidPaths !== undefined ? { invalidPaths: props.invalidPaths } : {})}
        />
    );
}
