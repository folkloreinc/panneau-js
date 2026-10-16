import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { ComboBox, Fieldset, IconButton, usePanneauIntl } from '@panneau/ui';

import { useFieldsContext } from '../shared/context';
import { cx } from '../shared/cx';
import { getFieldProps } from '../shared/entry';
import { messages } from '../shared/messages';
import {
    type RelationReference,
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

/**
 * A reference to an item of another resource, or several with `multiple`, picked by searching a
 * `RelationSource`. Values are references (`{ id, label }`), as items carry them; plain ids get
 * their labels from the source's `resolve()`. When the source can `create()` (or with `onCreate`),
 * the picker offers to create an item from the typed text. Without a source, the field shows its
 * references and can't change them.
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
        placeholder = intl.formatMessage(messages.search),
        onBlur,
        name,
        id,
        className,
        labelClassName,
        descriptionClassName,
        errorsClassName,
        controlClassName,
    } = props;
    const selected = useRelationReferences(source, resource, toReferences(props.value));
    const [query, setQuery] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
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
    const items = offersCreate
        ? [
              ...found,
              { id: CREATE_ID, label: intl.formatMessage(messages.createRelation, { text }) },
          ]
        : found;
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
    const chrome = {
        legend: label,
        errors: allErrors,
        isRequired: required,
        className,
        legendClassName: labelClassName,
        descriptionClassName,
        errorsClassName,
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
                {selected.length > 0 ? (
                    <References references={selected} removeLabel={removeLabel} />
                ) : (
                    <span className={styles.none}>{intl.formatMessage(messages.noRelation)}</span>
                )}
            </Fieldset>
        );
    }

    const comboLabel = typeof label === 'string' ? label : props['aria-label'];

    if (props.multiple === true) {
        const { onChange } = props;
        const set = (next: RelationReference[]) => onChange?.(next.length > 0 ? next : null);
        return (
            <Fieldset {...chrome} description={description}>
                <div className={styles.multiple}>
                    {selected.length > 0 ? (
                        <References
                            references={selected}
                            removeLabel={removeLabel}
                            onRemove={(reference) =>
                                set(selected.filter((entry) => entry.id !== reference.id))
                            }
                        />
                    ) : null}
                    <ComboBox
                        aria-label={comboLabel}
                        items={items
                            .filter((item) => !selected.some((entry) => entry.id === item.id))
                            .map((item) => ({ id: item.id, label: item.label }))}
                        value={null}
                        inputValue={query ?? ''}
                        onInputChange={setQuery}
                        onChange={(itemId) => {
                            if (itemId === CREATE_ID) {
                                createFrom((reference) => set([...selected, reference]));
                                return;
                            }
                            const reference = found.find((item) => item.id === itemId);
                            if (reference !== undefined) {
                                set([...selected, reference]);
                                setQuery(null);
                            }
                        }}
                        isLoading={isLoading}
                        placeholder={placeholder}
                        emptyMessage={intl.formatMessage(messages.noResults)}
                        {...(onBlur !== undefined ? { onBlur: () => onBlur() } : {})}
                        {...(name !== undefined ? { name } : {})}
                        {...(id !== undefined ? { id } : {})}
                        {...(controlClassName !== undefined ? { controlClassName } : {})}
                    />
                </div>
            </Fieldset>
        );
    }

    const { onChange } = props;
    const current = selected[0] ?? null;
    // The selected reference is among the items, so that the combo box knows its label.
    const shown =
        current !== null && !items.some((item) => item.id === current.id)
            ? [current, ...items]
            : items;
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
            {...(props['aria-label'] !== undefined ? { 'aria-label': props['aria-label'] } : {})}
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

/** The `relation` type: `resource` and `multiple`. Items search the fields context's source. */
export function RelationFieldEntry(props: FieldEntryProps) {
    const { field } = props;
    const references = toReferences(props.value);
    const shared = { ...getFieldProps(props), resource: field.resource ?? '' };
    if (field.multiple === true) {
        return <RelationField {...shared} multiple value={references} onChange={props.onChange} />;
    }
    return <RelationField {...shared} value={references[0] ?? null} onChange={props.onChange} />;
}
