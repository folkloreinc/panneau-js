import { Ellipsis, File, ImageOff, Pencil, Replace, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

import {
    Badge,
    Button,
    ComboBox,
    Fieldset,
    Icon,
    IconButton,
    Menu,
    MenuItem,
    MenuSection,
    MenuSeparator,
    MenuTrigger,
    ReorderMenu,
    Tile,
    TileGroup,
    type Tone,
    getNamedIcon,
    moveItem,
    useActionsFit,
    usePanneauIntl,
    useReorderMoves,
    useUndoToast,
} from '@panneau/ui';

import { useFieldsContext } from '../shared/context';
import { cx } from '../shared/cx';
import { getFieldProps } from '../shared/entry';
import { messages } from '../shared/messages';
import {
    type RelationReference,
    type RelationResourceInfo,
    type RelationSource,
    toReferences,
    useRelationReferences,
} from '../shared/relation';
import type { FieldEntryProps, FieldProps } from '../shared/types';
import styles from './RelationField.module.css';

/** The first button of a card that the focus goes to: not its handle or its menu of moves. */
const FIRST_BUTTON = 'button:not(.panneau-reorder-menu)';

/** Whether an element shows: the tools of a card or their menu, by the width of the field. */
function isShown(element: HTMLElement): boolean {
    return typeof element.checkVisibility === 'function'
        ? element.checkVisibility({ visibilityProperty: true })
        : true;
}

/** The first of the elements that shows. */
function firstShown(elements: Iterable<HTMLElement>): HTMLElement | undefined {
    for (const element of elements) {
        if (isShown(element)) {
            return element;
        }
    }
    return undefined;
}

/** The id of the "Create “…”" option of the picker. */
const CREATE_ID = '\u0000create';

/** What `useRelationSearch()` gives: the results so far, how many there are, and the next ones. */
export interface RelationSearchResults {
    items: RelationReference[];
    /** While the first results load. */
    isLoading: boolean;
    /** How many items match, when the source counts them (`searchPage()`), or else `null`. */
    total: number | null;
    /** Whether the source has more results than `items`. */
    hasMore: boolean;
    /** While the next results load. */
    isLoadingMore: boolean;
    /** Loads the next results, when there are more and none are loading. */
    loadMore: () => void;
}

interface SearchState {
    key: string;
    items: RelationReference[];
    total: number | null;
    next: string | null;
    isLoading: boolean;
    isLoadingMore: boolean;
}

const EMPTY_SEARCH: SearchState = {
    key: '',
    items: [],
    total: null,
    next: null,
    isLoading: false,
    isLoadingMore: false,
};

/** A page of results, from `searchPage()` when the source has it, or else `search()`. */
async function searchFrom(
    source: RelationSource,
    resource: string,
    query: string,
    options: { signal: AbortSignal; next?: string | undefined },
): Promise<{ items: RelationReference[]; total: number | null; next: string | null }> {
    if (source.searchPage === undefined) {
        return { items: await source.search(resource, query, options), total: null, next: null };
    }
    const page = await source.searchPage(resource, query, options);
    return { items: page.items, total: page.total ?? null, next: page.next ?? null };
}

/**
 * Results of a search in a relation source, as it types: the empty query at once, a typed one once
 * the user pauses (`delay`). Nothing, and not loading, while `enabled` is false. With a source that
 * has `searchPage()`, it says how many items match, and `loadMore()` adds the next page.
 */
export function useRelationSearch(
    source: RelationSource | null,
    resource: string,
    query: string,
    { enabled = true, delay = 250 }: { enabled?: boolean; delay?: number } = {},
): RelationSearchResults {
    const [state, setState] = useState<SearchState>(EMPTY_SEARCH);
    const key = `${resource}\u0000${query}`;
    // The request of the next page, aborted when the search changes
    const more = useRef<AbortController | null>(null);

    useEffect(() => {
        if (source === null || !enabled) {
            return undefined;
        }
        const controller = new AbortController();
        // The first options at once; what is typed once the user pauses
        const timer = setTimeout(
            () => {
                setState((current) => ({ ...current, key, isLoading: true }));
                searchFrom(source, resource, query, { signal: controller.signal })
                    .then(({ items, total, next }) => {
                        if (!controller.signal.aborted) {
                            setState({ ...EMPTY_SEARCH, key, items, total, next });
                        }
                    })
                    .catch(() => {
                        if (!controller.signal.aborted) {
                            setState({ ...EMPTY_SEARCH, key });
                        }
                    });
            },
            query === '' ? 0 : delay,
        );
        return () => {
            clearTimeout(timer);
            controller.abort();
            more.current?.abort();
            more.current = null;
        };
    }, [source, resource, query, key, enabled, delay]);

    const current = state.key === key;
    const loadMore = () => {
        const { next } = state;
        if (
            source === null ||
            !current ||
            next === null ||
            state.isLoading ||
            more.current !== null
        ) {
            return;
        }
        const controller = new AbortController();
        more.current = controller;
        setState((previous) => ({ ...previous, isLoadingMore: true }));
        searchFrom(source, resource, query, { signal: controller.signal, next })
            .then((page) => {
                if (controller.signal.aborted) {
                    return;
                }
                setState((previous) => ({
                    ...previous,
                    // An item that moved to the next page while the user scrolled shows once
                    items: [
                        ...previous.items,
                        ...page.items.filter(
                            (item) => !previous.items.some((entry) => entry.id === item.id),
                        ),
                    ],
                    total: page.total ?? previous.total,
                    next: page.next,
                    isLoadingMore: false,
                }));
            })
            .catch(() => {
                if (!controller.signal.aborted) {
                    // Scrolling to the end again asks for it again
                    setState((previous) => ({ ...previous, isLoadingMore: false }));
                }
            })
            .finally(() => {
                if (more.current === controller) {
                    more.current = null;
                }
            });
    };

    return {
        items: state.items,
        isLoading: enabled && (state.isLoading || !current),
        total: enabled && current ? state.total : null,
        hasMore: enabled && current && state.next !== null,
        isLoadingMore: enabled && current && state.isLoadingMore,
        loadMore,
    };
}

/** Props of both single and multiple relation fields. */
export interface RelationFieldBaseProps extends Omit<FieldProps<never>, 'value' | 'onChange'> {
    /** Id of the related resource, passed to the source. */
    resource: string;
    /** Where to search. Defaults to the fields context's. Without one, the field is read-only. */
    source?: RelationSource | null;
    /**
     * Creates an item from the typed text, offered as "Create “…”" in the picker: it can open a
     * dialog or a panel, and resolves with the new reference, or `null` when nothing was created.
     * The new item is added (after the others in a multiple field, in place of the item in a single
     * one), and the focus comes back to the field. Defaults to the source's `create()`. `null`
     * turns creating off.
     */
    onCreate?: ((text: string) => Promise<RelationReference | null>) | null;
    placeholder?: string;
    controlClassName?: string;
    /**
     * Shows the items as chips, and the single item as the text of its picker, rather than as cards
     * (decision 0067): for small places, such as the filters of a list.
     */
    compact?: boolean;
}

export interface SingleRelationFieldProps extends RelationFieldBaseProps {
    multiple?: false;
    value?: RelationReference | null;
    onChange?: (value: RelationReference | null) => void;
}

export interface MultipleRelationFieldProps extends RelationFieldBaseProps {
    multiple: true;
    value?: readonly RelationReference[] | null;
    /** Called with the references. An empty list is `null`. */
    onChange?: (value: RelationReference[] | null) => void;
}

export type RelationFieldProps = SingleRelationFieldProps | MultipleRelationFieldProps;

/** The items of a compact field, as chips. */
function References({
    references,
    onRemove,
    removeLabel,
}: {
    references: readonly RelationReference[];
    onRemove?: (reference: RelationReference) => void;
    removeLabel: (reference: RelationReference) => string;
}) {
    return (
        <ul className={cx(styles.selected, onRemove === undefined && styles.readOnly)}>
            {references.map((reference) => (
                <li key={reference.id} className={styles.reference}>
                    <span className={styles.referenceLabel}>{reference.label}</span>
                    {onRemove !== undefined ? (
                        <IconButton
                            icon={X}
                            size="sm"
                            label={removeLabel(reference)}
                            showTooltip={false}
                            onPress={() => onRemove(reference)}
                        />
                    ) : null}
                </li>
            ))}
        </ul>
    );
}

/** The state of an item, as a badge in its tone (decision 0103). */
function StatusBadge({ reference }: { reference: RelationReference }) {
    if (reference.status === undefined) {
        return null;
    }
    return (
        <Badge tone={(reference.status.tone ?? 'neutral') as Tone}>{reference.status.label}</Badge>
    );
}

/** The icon of an item without an image: a broken image when its resource has images. */
function placeholderIcon(info: RelationResourceInfo | null) {
    return info?.image === true
        ? ImageOff
        : info?.icon !== undefined
          ? getNamedIcon(info.icon)
          : File;
}

/** The square before the label of an option: the item's image, or the resource's icon. */
function Thumbnail({
    reference,
    info,
}: {
    reference: RelationReference;
    info: RelationResourceInfo | null;
}) {
    return (
        <span className={styles.thumbnail} aria-hidden="true">
            {reference.imageUrl !== undefined ? (
                <img src={reference.imageUrl} alt="" loading="lazy" />
            ) : (
                <Icon icon={placeholderIcon(info)} />
            )}
        </span>
    );
}

interface CardsProps {
    references: readonly RelationReference[];
    info: RelationResourceInfo | null;
    getHref: (reference: RelationReference) => string | null;
    /** Their links open in a new tab (`linksInNewTab` of the source). */
    external: boolean;
    /** Picks another item in place of this one: the single field's "Change". */
    onChange?: ((reference: RelationReference) => void) | undefined;
    /** Edits the item, where the source does (`edit()`), for the cards that `canEdit` allows. */
    onEdit?: ((reference: RelationReference, index: number) => void) | undefined;
    canEdit?: ((reference: RelationReference) => boolean) | undefined;
    onRemove?: ((reference: RelationReference) => void) | undefined;
    /**
     * Reorders the cards of a multiple field (decision 0111): a handle before each card drags it,
     * and a menu in its actions moves it.
     */
    onMove?: ((from: number, to: number) => void) | undefined;
    removeLabel: (reference: RelationReference) => string;
    changeLabel: (reference: RelationReference) => string;
    editLabel: (reference: RelationReference) => string;
    /** The text of the menu item that changes the item. */
    changeText: string;
    /** The text of the menu item that edits the item. */
    editText: string;
    /** The text of the menu item that removes the item. */
    removeText: string;
    /** Names the menu of a card's actions, in a narrow field. */
    actionsLabel: (reference: RelationReference) => string;
    /** Names the list, for screen readers. */
    'aria-label'?: string | undefined;
}

interface CardActionsProps {
    reference: RelationReference;
    onChange?: (() => void) | undefined;
    onEdit?: (() => void) | undefined;
    onRemove?: (() => void) | undefined;
    reorders: boolean;
    labels: Pick<
        CardsProps,
        | 'removeLabel'
        | 'changeLabel'
        | 'editLabel'
        | 'changeText'
        | 'editText'
        | 'removeText'
        | 'actionsLabel'
    >;
}

/**
 * The buttons of a card, as icon buttons with tooltips, so that its title keeps the room of the
 * row (#518). Where they don't fit next to the title at its minimum width, they are one "⋯" menu,
 * with the moves of the item: one menu per card (`useActionsFit`, decision 0114).
 */
function CardActions({
    reference,
    onChange,
    onEdit,
    onRemove,
    reorders,
    labels,
}: CardActionsProps) {
    const { moves, move } = useReorderMoves();
    const movable = reorders && moves.length > 0;
    const count =
        (onChange !== undefined ? 1 : 0) +
        (onEdit !== undefined ? 1 : 0) +
        (onRemove !== undefined ? 1 : 0) +
        (movable ? 1 : 0);
    const fit = useActionsFit();
    // One button stays a button: a menu of one action would only hide it
    const collapses = count > 1 && !fit.inline;
    return (
        <>
            <StatusBadge reference={reference} />
            {count > 0 ? (
                <span
                    ref={count > 1 ? fit.ref : undefined}
                    data-actions-inline
                    className={cx(styles.tools, collapses && fit.className)}
                >
                    {onChange !== undefined ? (
                        <IconButton
                            icon={Replace}
                            size="sm"
                            label={labels.changeLabel(reference)}
                            onPress={onChange}
                        />
                    ) : null}
                    {onEdit !== undefined ? (
                        <IconButton
                            icon={Pencil}
                            size="sm"
                            label={labels.editLabel(reference)}
                            data-relation-action="edit"
                            onPress={onEdit}
                        />
                    ) : null}
                    {reorders ? <ReorderMenu /> : null}
                    {onRemove !== undefined ? (
                        <IconButton
                            icon={X}
                            size="sm"
                            label={labels.removeLabel(reference)}
                            onPress={onRemove}
                        />
                    ) : null}
                </span>
            ) : null}
            {collapses ? (
                <MenuTrigger>
                    <IconButton
                        icon={Ellipsis}
                        size="sm"
                        label={labels.actionsLabel(reference)}
                        data-relation-action="menu"
                        data-actions-menu
                    />
                    <Menu
                        placement="bottom end"
                        onAction={(key) => {
                            const id = String(key);
                            if (id === 'change') {
                                onChange?.();
                            } else if (id === 'edit') {
                                onEdit?.();
                            } else if (id === 'remove') {
                                onRemove?.();
                            } else {
                                const target = moves.find(
                                    (candidate) => `move-${candidate.id}` === id,
                                );
                                if (target !== undefined) {
                                    move(target.to);
                                }
                            }
                        }}
                    >
                        {onChange !== undefined ? (
                            <MenuItem id="change" icon={Replace}>
                                {labels.changeText}
                            </MenuItem>
                        ) : null}
                        {onEdit !== undefined ? (
                            <MenuItem id="edit" icon={Pencil}>
                                {labels.editText}
                            </MenuItem>
                        ) : null}
                        {movable ? (
                            <MenuSection aria-label={labels.actionsLabel(reference)}>
                                {moves.map((candidate) => (
                                    <MenuItem key={candidate.id} id={`move-${candidate.id}`}>
                                        {candidate.label}
                                    </MenuItem>
                                ))}
                            </MenuSection>
                        ) : null}
                        {onRemove !== undefined ? <MenuSeparator /> : null}
                        {onRemove !== undefined ? (
                            <MenuItem id="remove" icon={X} isDanger>
                                {labels.removeText}
                            </MenuItem>
                        ) : null}
                    </Menu>
                </MenuTrigger>
            ) : null}
        </>
    );
}

/**
 * The chosen items, as tiles (decisions 0067 and 0092): the image of each one, or its resource's
 * icon, its label, linked to the item when the source says where it opens, its description, its
 * status (decision 0103), and the buttons that change, edit (decision 0110) or remove it. The
 * label has the room first: it is cut only as a last resort, whole in its tooltip.
 */
function RelationCards({
    references,
    info,
    getHref,
    external,
    onChange,
    onEdit,
    canEdit,
    onRemove,
    onMove,
    'aria-label': ariaLabel,
    ...labels
}: CardsProps) {
    return (
        <TileGroup
            appearance="outline"
            label={ariaLabel}
            onMove={onMove}
            itemLabel={(index) => references[index]?.label ?? ''}
        >
            {references.map((reference, index) => {
                const editable = onEdit !== undefined && canEdit?.(reference) !== false;
                return (
                    <Tile
                        key={reference.id}
                        title={<span title={reference.label}>{reference.label}</span>}
                        description={reference.description}
                        // Through React Aria: an app's `RouterProvider` opens it with its router
                        href={getHref(reference) ?? undefined}
                        external={external}
                        className={styles.card}
                        {...(reference.imageUrl !== undefined
                            ? { media: <img src={reference.imageUrl} alt="" loading="lazy" /> }
                            : { icon: placeholderIcon(info) })}
                        actions={
                            onChange !== undefined ||
                            editable ||
                            onRemove !== undefined ||
                            onMove !== undefined ||
                            reference.status !== undefined ? (
                                <CardActions
                                    reference={reference}
                                    onChange={
                                        onChange !== undefined
                                            ? () => onChange(reference)
                                            : undefined
                                    }
                                    onEdit={editable ? () => onEdit(reference, index) : undefined}
                                    onRemove={
                                        onRemove !== undefined
                                            ? () => onRemove(reference)
                                            : undefined
                                    }
                                    reorders={onMove !== undefined}
                                    labels={labels}
                                />
                            ) : undefined
                        }
                    />
                );
            })}
        </TileGroup>
    );
}

/**
 * A reference to an item of another resource, or several with `multiple`, picked by searching a
 * `RelationSource`. Values are references (`{ id, label }`), as items carry them; plain ids get
 * their labels from the source's `resolve()`. The chosen items show as cards (decision 0067), with
 * their image and their description when the source gives them, a link to each one
 * (`getItemHref()`), and buttons to change or remove them. When the source can `create()` (or with
 * `onCreate`), the picker offers to create an item from the typed text. Without a source, the field
 * shows its items and can't change them.
 */
export function RelationField(props: RelationFieldProps) {
    const intl = usePanneauIntl();
    const context = useFieldsContext();
    const source = props.source === undefined ? context.relationSource : props.source;
    const {
        resource,
        label,
        description,
        errors,
        disabled,
        readOnly,
        required,
        onBlur,
        name,
        id,
        className,
        labelClassName,
        descriptionClassName,
        errorsClassName,
        controlClassName,
        compact = false,
    } = props;
    const placeholder =
        // As a default value did: only when the prop is left out, not when it is `null`.
        props.placeholder === undefined ? intl.formatMessage(messages.search) : props.placeholder;
    const editable = source !== null && disabled !== true && readOnly !== true;
    // Its cards offer "Edit" where the source edits items (decision 0110): the source then needs
    // to know the items, for whether the user can edit them
    const sourceEdit = editable && !compact ? source.edit : undefined;
    // The items saved from their card: they show as saved, in place of what the value says
    const [edited, setEdited] = useState<Readonly<Record<string, RelationReference>>>({});
    const selected = useRelationReferences(source, resource, toReferences(props.value), {
        resolveAll: sourceEdit !== undefined,
    }).map(
        (reference) =>
            edited[`${resource}\u0000${reference.id}`] ??
            source?.edited?.(resource, reference.id) ??
            reference,
    );
    const info = source?.describe?.(resource) ?? null;
    const [query, setQuery] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const [editError, setEditError] = useState<string | null>(null);
    // The item being edited, until `edit()` settles
    const [editing, setEditing] = useState<string | null>(null);
    // The single field picks another item in place of its card
    const [changing, setChanging] = useState(false);
    const container = useRef<HTMLDivElement>(null);
    // Where the focus goes once the field changed: the picker, or the card that replaced it
    // (the first button of a card, by its index), or the "Edit" of a card once its item is saved
    const focusNext = useRef<'picker' | number | { edit: number } | null>(null);
    useEffect(() => {
        const target = focusNext.current;
        if (target === null) {
            return;
        }
        focusNext.current = null;
        const cards = container.current?.querySelectorAll('.panneau-tile') ?? [];
        const index = typeof target === 'object' ? target.edit : target;
        const card = index !== 'picker' ? cards[Math.min(index, cards.length - 1)] : undefined;
        // The buttons of a card that show: its tools, or their menu in a narrow field
        const first = (selector: string) =>
            card !== undefined
                ? firstShown(card.querySelectorAll<HTMLElement>(selector))
                : undefined;
        const element =
            card !== undefined
                ? typeof target === 'object'
                    ? (first('[data-relation-action="edit"]') ??
                      first('[data-relation-action="menu"]') ??
                      first(FIRST_BUTTON))
                    : first(FIRST_BUTTON)
                : container.current?.querySelector<HTMLElement>('input');
        element?.focus();
    });

    // "Undo" after a removal (decision 0063): the item goes back at its place, in the latest value
    const undoToast = useUndoToast();
    const fieldId = useId();
    const restore = (reference: RelationReference, index: number, following?: string) => {
        if (selected.some((entry) => entry.id === reference.id)) {
            return;
        }
        // Before the item that followed it, or at its index
        const before = selected.findIndex((entry) => entry.id === following);
        const at = before !== -1 ? before : Math.min(index, selected.length);
        if (props.multiple === true) {
            props.onChange?.(selected.toSpliced(at, 0, reference));
        } else {
            props.onChange?.(reference);
        }
        setChanging(false);
        focusNext.current = at;
    };
    const latest = useRef(restore);
    useEffect(() => {
        latest.current = restore;
    });
    const offerUndo = (reference: RelationReference, index: number, following?: string) =>
        undoToast?.(
            {
                title: intl.formatMessage(messages.removed, { name: reference.label }),
                undoneTitle: intl.formatMessage(messages.restored, { name: reference.label }),
                onUndo: () => latest.current(reference, index, following),
            },
            { key: `${fieldId}-${reference.id}` },
        );

    // The picker searches once it is about to be used: the field has the focus, the pointer is
    // over it, or it opens. A form of many relation fields doesn't search for each one.
    const [wanted, setWanted] = useState(false);
    const want = () => {
        if (!wanted) {
            setWanted(true);
        }
    };
    const {
        items: found,
        isLoading: searching,
        total,
        hasMore,
        isLoadingMore,
        loadMore,
    } = useRelationSearch(source, resource, query ?? '', { enabled: editable && wanted });
    const sourceCreate = source?.create;
    const create =
        props.onCreate !== undefined
            ? props.onCreate
            : sourceCreate !== undefined && source?.canCreate?.(resource) !== false
              ? (text: string) => sourceCreate.call(source, resource, text)
              : null;
    const text = (query ?? '').trim();
    const offersCreate =
        create !== null &&
        text !== '' &&
        !searching &&
        ![...found, ...selected].some(
            (item) =>
                item.label.toLocaleLowerCase(intl.locale) === text.toLocaleLowerCase(intl.locale),
        );
    const isLoading = searching || creating;
    const fieldErrors = [createError, editError].filter((error) => error !== null);
    const allErrors = fieldErrors.length > 0 ? [...(errors ?? []), ...fieldErrors] : errors;
    /** Creates an item from the text, then adds its reference with `add`. */
    const createFrom = (add: (reference: RelationReference) => void) => {
        if (create === null) {
            return;
        }
        setCreating(true);
        setCreateError(null);
        create(text)
            .then((reference) => {
                // Back to the field, from the dialog or the panel that created it: on the picker,
                // or on the new card that `add` focuses
                focusNext.current = 'picker';
                if (reference !== null) {
                    add(reference);
                    setQuery(null);
                }
            })
            .catch(() =>
                setCreateError(intl.formatMessage(messages.createRelationFailed, { text })),
            )
            .finally(() => setCreating(false));
    };
    /** Edits the item of a card where the source does, then shows it as saved. */
    const edit = (reference: RelationReference, index: number) => {
        if (sourceEdit === undefined || source === null || editing !== null) {
            return;
        }
        setEditing(reference.id);
        setEditError(null);
        sourceEdit
            .call(source, resource, reference.id)
            .then((saved) => {
                if (saved !== null) {
                    const key = `${resource}\u0000${saved.id}`;
                    setEdited((current) => ({ ...current, [key]: saved }));
                }
            })
            .catch(() =>
                setEditError(
                    intl.formatMessage(messages.editRelationFailed, { item: reference.label }),
                ),
            )
            .finally(() => {
                // Back to the card, from the panel that edited its item
                focusNext.current = { edit: index };
                setEditing(null);
            });
    };
    const removeLabel = (reference: RelationReference) =>
        `${intl.formatMessage(messages.remove)} ${reference.label}`;
    const changeLabel = (reference: RelationReference) =>
        intl.formatMessage(messages.changeRelation, { item: reference.label });
    const getHref = (reference: RelationReference) =>
        source?.getItemHref?.(resource, reference.id) ?? null;
    const cards = {
        info,
        getHref,
        external: source?.linksInNewTab === true,
        removeLabel,
        changeLabel,
        editLabel: (reference: RelationReference) =>
            intl.formatMessage(messages.editRelation, { item: reference.label }),
        changeText: intl.formatMessage(messages.change),
        editText: intl.formatMessage(messages.edit),
        removeText: intl.formatMessage(messages.remove),
        actionsLabel: (reference: RelationReference) =>
            intl.formatMessage(messages.relationActions, { item: reference.label }),
        ...(sourceEdit !== undefined
            ? {
                  onEdit: edit,
                  canEdit: (reference: RelationReference) =>
                      source?.canEdit?.(resource, reference.id) !== false,
              }
            : {}),
    };
    const chrome = {
        legend: label,
        errors: allErrors,
        isRequired: required,
        className,
        legendClassName: labelClassName,
        descriptionClassName,
        errorsClassName,
    };
    const comboLabel = typeof label === 'string' ? label : props['aria-label'];
    // The options of the picker, with the image and the description of each item
    const options = (exclude: readonly RelationReference[]) => [
        ...found
            .filter((item) => !exclude.some((entry) => entry.id === item.id))
            .map((item) => ({
                id: item.id,
                label: item.label,
                ...(item.description !== undefined ? { description: item.description } : {}),
                ...(info?.image === true || item.imageUrl !== undefined
                    ? {
                          prefix: <Thumbnail reference={item} info={info} />,
                      }
                    : {}),
                ...(item.status !== undefined
                    ? {
                          badge: {
                              label: item.status.label,
                              tone: (item.status.tone ?? 'neutral') as Tone,
                          },
                      }
                    : {}),
            })),
        ...(offersCreate
            ? [{ id: CREATE_ID, label: intl.formatMessage(messages.createRelation, { text }) }]
            : []),
    ];
    const pick = (itemId: string | null, add: (reference: RelationReference) => void) => {
        if (itemId === CREATE_ID) {
            createFrom(add);
            return;
        }
        const reference = found.find((item) => item.id === itemId);
        if (reference !== undefined) {
            add(reference);
            setQuery(null);
        }
    };
    const pickerProps = {
        onFocus: want,
        onOpenChange: (open: boolean) => {
            if (open) {
                want();
            }
        },
        'aria-label': comboLabel,
        inputValue: query ?? '',
        onInputChange: setQuery,
        isLoading,
        isRequired: required,
        placeholder,
        emptyMessage: intl.formatMessage(messages.noResults),
        // The next results as the list scrolls to its end, and how many there are
        ...(hasMore ? { onLoadMore: loadMore, isLoadingMore } : {}),
        ...(total !== null && !searching
            ? {
                  footer:
                      found.length < total
                          ? intl.formatMessage(messages.relationResultsShown, {
                                shown: found.length,
                                count: total,
                            })
                          : intl.formatMessage(messages.relationResults, { count: total }),
              }
            : {}),
        ...(onBlur !== undefined ? { onBlur: () => onBlur() } : {}),
        ...(name !== undefined ? { name } : {}),
        ...(id !== undefined ? { id } : {}),
        ...(controlClassName !== undefined ? { controlClassName } : {}),
    };

    if (!editable) {
        return (
            <Fieldset
                {...chrome}
                description={
                    source === null && disabled !== true && readOnly !== true ? (
                        <>
                            {description} {intl.formatMessage(messages.relationUnavailable)}
                        </>
                    ) : (
                        description
                    )
                }
            >
                {selected.length > 0 && compact ? (
                    <References references={selected} removeLabel={removeLabel} />
                ) : selected.length > 0 ? (
                    <RelationCards {...cards} references={selected} />
                ) : (
                    <span className={styles.none}>{intl.formatMessage(messages.noRelation)}</span>
                )}
            </Fieldset>
        );
    }

    if (props.multiple === true) {
        const { onChange } = props;
        const set = (next: RelationReference[]) => onChange?.(next.length > 0 ? next : null);
        const remove = (reference: RelationReference) => {
            set(selected.filter((entry) => entry.id !== reference.id));
            const index = selected.indexOf(reference);
            offerUndo(reference, index, selected[index + 1]?.id);
        };
        return (
            <Fieldset {...chrome} description={description}>
                <div ref={container} className={styles.multiple} onPointerEnter={want}>
                    {selected.length > 0 && compact ? (
                        <References
                            references={selected}
                            removeLabel={removeLabel}
                            onRemove={remove}
                        />
                    ) : selected.length > 0 ? (
                        <RelationCards
                            {...cards}
                            references={selected}
                            // The value's order follows the cards
                            onMove={(from, to) => set(moveItem(selected, from, to))}
                            onRemove={(reference) => {
                                remove(reference);
                                // The next card, or the last one, so that several go in a row
                                focusNext.current = selected.indexOf(reference);
                            }}
                        />
                    ) : null}
                    <ComboBox
                        {...pickerProps}
                        items={options(selected)}
                        value={null}
                        onChange={(itemId) =>
                            pick(itemId, (reference) => set([...selected, reference]))
                        }
                    />
                </div>
            </Fieldset>
        );
    }

    const { onChange } = props;
    const current = selected[0] ?? null;
    // The selected reference is among the items, so that the combo box knows its label.
    const items = options([]);
    const shown =
        current !== null && !items.some((item) => item.id === current.id)
            ? [current, ...items]
            : items;
    if (compact) {
        return (
            <ComboBox
                label={label}
                description={description}
                errors={allErrors}
                isRequired={required}
                className={className}
                labelClassName={labelClassName}
                descriptionClassName={descriptionClassName}
                errorsClassName={errorsClassName}
                {...(controlClassName !== undefined ? { controlClassName } : {})}
                onFocus={want}
                onOpenChange={(open) => {
                    if (open) {
                        want();
                    }
                }}
                {...(props['aria-label'] !== undefined
                    ? { 'aria-label': props['aria-label'] }
                    : {})}
                items={shown.map((item) => ({ id: item.id, label: item.label }))}
                value={current?.id ?? null}
                inputValue={query ?? current?.label ?? ''}
                onInputChange={(text) => {
                    setQuery(text);
                    if (text === '' && current !== null) {
                        onChange?.(null);
                    }
                }}
                onChange={(itemId) => {
                    if (itemId === CREATE_ID) {
                        createFrom((reference) => onChange?.(reference));
                        return;
                    }
                    setQuery(null);
                    if (itemId === null) {
                        return;
                    }
                    const reference = shown.find((item) => item.id === itemId) ?? null;
                    if (reference?.id !== current?.id) {
                        onChange?.(reference);
                    }
                }}
                isLoading={isLoading}
                placeholder={placeholder}
                emptyMessage={intl.formatMessage(messages.noResults)}
                {...(onBlur !== undefined
                    ? {
                          onBlur: () => {
                              setQuery(null);
                              onBlur();
                          },
                      }
                    : { onBlur: () => setQuery(null) })}
                {...(name !== undefined ? { name } : {})}
                {...(id !== undefined ? { id } : {})}
            />
        );
    }
    const cancel = () => {
        setChanging(false);
        setQuery(null);
        focusNext.current = 0;
    };
    return (
        <Fieldset {...chrome} description={description}>
            <div
                ref={container}
                className={styles.single}
                onPointerEnter={want}
                // Escape, once the picker has nothing to close or clear, keeps the item
                onKeyDown={(event) => {
                    if (event.key === 'Escape' && changing && current !== null) {
                        cancel();
                    }
                }}
            >
                {current !== null && !changing ? (
                    <RelationCards
                        {...cards}
                        references={[current]}
                        onChange={() => {
                            setChanging(true);
                            focusNext.current = 'picker';
                        }}
                        onRemove={() => {
                            onChange?.(null);
                            offerUndo(current, 0);
                            focusNext.current = 'picker';
                        }}
                    />
                ) : (
                    <div className={styles.picker}>
                        <ComboBox
                            {...pickerProps}
                            className={styles.combo}
                            items={options(current !== null ? [current] : [])}
                            value={null}
                            onChange={(itemId) =>
                                pick(itemId, (reference) => {
                                    if (reference.id !== current?.id) {
                                        onChange?.(reference);
                                    }
                                    setChanging(false);
                                    focusNext.current = 0;
                                })
                            }
                        />
                        {changing && current !== null ? (
                            <Button size="sm" appearance="ghost" onPress={cancel}>
                                {intl.formatMessage(messages.cancelChange)}
                            </Button>
                        ) : null}
                    </div>
                )}
            </div>
        </Fieldset>
    );
}

/** The `relation` type: `resource` and `multiple`. Items search the fields context's source. */
export function RelationFieldEntry(props: FieldEntryProps) {
    const { field } = props;
    const references = toReferences(props.value);
    // A relation names one resource: `lintDefinition()` reports a list (only `media` fields take one).
    const resource = typeof field.resource === 'string' ? field.resource : '';
    const shared = { ...getFieldProps(props), resource };
    if (field.multiple === true) {
        return <RelationField {...shared} multiple value={references} onChange={props.onChange} />;
    }
    return <RelationField {...shared} value={references[0] ?? null} onChange={props.onChange} />;
}
