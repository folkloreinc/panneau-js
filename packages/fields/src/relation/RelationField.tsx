import { File, ImageOff, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-aria-components';

import {
    Button,
    ComboBox,
    Fieldset,
    Icon,
    IconButton,
    getNamedIcon,
    usePanneauIntl,
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

/** The id of the "Create “…”" option of the picker. */
const CREATE_ID = '\u0000create';

/** Results of a search in a relation source, as it types. */
export function useRelationSearch(
    source: RelationSource | null,
    resource: string,
    query: string,
    { enabled = true, delay = 250 }: { enabled?: boolean; delay?: number } = {},
): { items: RelationReference[]; isLoading: boolean } {
    const [state, setState] = useState<{
        key: string;
        items: RelationReference[];
        isLoading: boolean;
    }>({ key: '', items: [], isLoading: false });
    const key = `${resource}\u0000${query}`;

    useEffect(() => {
        if (source === null || !enabled) {
            return undefined;
        }
        const controller = new AbortController();
        const timer = setTimeout(() => {
            setState((current) => ({ ...current, key, isLoading: true }));
            source
                .search(resource, query, { signal: controller.signal })
                .then((items) => {
                    if (!controller.signal.aborted) {
                        setState({ key, items, isLoading: false });
                    }
                })
                .catch(() => {
                    if (!controller.signal.aborted) {
                        setState({ key, items: [], isLoading: false });
                    }
                });
        }, delay);
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [source, resource, query, key, enabled, delay]);

    return { items: state.items, isLoading: state.isLoading || state.key !== key };
}

/** Props of both single and multiple relation fields. */
export interface RelationFieldBaseProps extends Omit<FieldProps<never>, 'value' | 'onChange'> {
    /** Id of the related resource, passed to the source. */
    resource: string;
    /** Where to search. Defaults to the fields context's. Without one, the field is read-only. */
    source?: RelationSource | null;
    /**
     * Creates an item from the typed text, offered as "Create “…”" in the picker: it can open a
     * dialog, and resolves with the new reference, or `null` when nothing was created. Defaults to
     * the source's `create()`. `null` turns creating off.
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

/** The square before the label of a card or an option: the item's image, or the resource's icon. */
function Thumbnail({
    reference,
    info,
    className,
}: {
    reference: RelationReference;
    info: RelationResourceInfo | null;
    className?: string;
}) {
    return (
        <span className={cx(styles.thumbnail, className)} aria-hidden="true">
            {reference.imageUrl !== undefined ? (
                <img src={reference.imageUrl} alt="" loading="lazy" />
            ) : (
                <Icon
                    icon={
                        info?.image === true
                            ? ImageOff
                            : info?.icon !== undefined
                              ? getNamedIcon(info.icon)
                              : File
                    }
                />
            )}
        </span>
    );
}

interface CardsProps {
    references: readonly RelationReference[];
    info: RelationResourceInfo | null;
    getHref: (reference: RelationReference) => string | null;
    /** Picks another item in place of this one: the single field's "Change". */
    onChange?: ((reference: RelationReference) => void) | undefined;
    onRemove?: ((reference: RelationReference) => void) | undefined;
    removeLabel: (reference: RelationReference) => string;
    changeLabel: (reference: RelationReference) => string;
    /** The visible text of the button that changes the item. */
    changeText: string;
    /** Names the list, for screen readers. */
    'aria-label'?: string | undefined;
}

/**
 * The chosen items, as cards (decision 0067): the image of each one, or its resource's icon, its
 * label, linked to the item when the source says where it opens, its description, and the buttons
 * that change or remove it.
 */
function RelationCards({
    references,
    info,
    getHref,
    onChange,
    onRemove,
    removeLabel,
    changeLabel,
    changeText,
    'aria-label': ariaLabel,
}: CardsProps) {
    return (
        <ul className={styles.cards} aria-label={ariaLabel}>
            {references.map((reference) => {
                const href = getHref(reference);
                return (
                    <li key={reference.id} className={styles.card} data-relation-card="">
                        <Thumbnail reference={reference} info={info} />
                        <span className={styles.cardText}>
                            {href !== null ? (
                                // Through React Aria: an app's `RouterProvider` opens it with its router
                                <Link href={href} className={cx(styles.cardLabel, styles.link)}>
                                    {reference.label}
                                </Link>
                            ) : (
                                <span className={styles.cardLabel}>{reference.label}</span>
                            )}
                            {reference.description !== undefined ? (
                                <span className={styles.cardDescription}>
                                    {reference.description}
                                </span>
                            ) : null}
                        </span>
                        {onChange !== undefined || onRemove !== undefined ? (
                            <span className={styles.cardActions}>
                                {onChange !== undefined ? (
                                    <Button
                                        size="sm"
                                        appearance="ghost"
                                        aria-label={changeLabel(reference)}
                                        onPress={() => onChange(reference)}
                                    >
                                        {changeText}
                                    </Button>
                                ) : null}
                                {onRemove !== undefined ? (
                                    <IconButton
                                        icon={X}
                                        size="sm"
                                        label={removeLabel(reference)}
                                        onPress={() => onRemove(reference)}
                                    />
                                ) : null}
                            </span>
                        ) : null}
                    </li>
                );
            })}
        </ul>
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
    const placeholder = props.placeholder ?? intl.formatMessage(messages.search);
    const selected = useRelationReferences(source, resource, toReferences(props.value));
    const info = source?.describe?.(resource) ?? null;
    const [query, setQuery] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    // The single field picks another item in place of its card
    const [changing, setChanging] = useState(false);
    const container = useRef<HTMLDivElement>(null);
    // Where the focus goes once the field changed: the picker, or the card that replaced it
    // (the first button of a card, by its index)
    const focusNext = useRef<'picker' | number | null>(null);
    useEffect(() => {
        const target = focusNext.current;
        if (target === null) {
            return;
        }
        focusNext.current = null;
        const cards = container.current?.querySelectorAll('[data-relation-card]') ?? [];
        const card = target !== 'picker' ? cards[Math.min(target, cards.length - 1)] : undefined;
        const element =
            card !== undefined
                ? card.querySelector<HTMLElement>('button')
                : container.current?.querySelector<HTMLElement>('input');
        element?.focus();
    });
    const editable = source !== null && disabled !== true && readOnly !== true;
    const { items: found, isLoading: searching } = useRelationSearch(
        source,
        resource,
        query ?? '',
        { enabled: editable },
    );
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
    const allErrors = createError !== null ? [...(errors ?? []), createError] : errors;
    /** Creates an item from the text, then adds its reference with `add`. */
    const createFrom = (add: (reference: RelationReference) => void) => {
        if (create === null) {
            return;
        }
        setCreating(true);
        setCreateError(null);
        create(text)
            .then((reference) => {
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
    const removeLabel = (reference: RelationReference) =>
        `${intl.formatMessage(messages.remove)} ${reference.label}`;
    const changeLabel = (reference: RelationReference) =>
        intl.formatMessage(messages.changeRelation, { item: reference.label });
    const getHref = (reference: RelationReference) =>
        source?.getItemHref?.(resource, reference.id) ?? null;
    const cards = {
        info,
        getHref,
        removeLabel,
        changeLabel,
        changeText: intl.formatMessage(messages.change),
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
                          prefix: (
                              <Thumbnail
                                  reference={item}
                                  info={info}
                                  className={styles.optionThumbnail}
                              />
                          ),
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
        'aria-label': comboLabel,
        inputValue: query ?? '',
        onInputChange: setQuery,
        isLoading,
        isRequired: required,
        placeholder,
        emptyMessage: intl.formatMessage(messages.noResults),
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
        return (
            <Fieldset {...chrome} description={description}>
                <div ref={container} className={styles.multiple}>
                    {selected.length > 0 && compact ? (
                        <References
                            references={selected}
                            removeLabel={removeLabel}
                            onRemove={(reference) =>
                                set(selected.filter((entry) => entry.id !== reference.id))
                            }
                        />
                    ) : selected.length > 0 ? (
                        <RelationCards
                            {...cards}
                            references={selected}
                            onRemove={(reference) => {
                                set(selected.filter((entry) => entry.id !== reference.id));
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
                            focusNext.current = 'picker';
                        }}
                    />
                ) : (
                    <div className={styles.picker}>
                        <ComboBox
                            {...pickerProps}
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
