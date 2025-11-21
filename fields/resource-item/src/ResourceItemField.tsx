import classNames from 'classnames';
import isArray from 'lodash-es/isArray';
import isEmpty from 'lodash-es/isEmpty';
import uniqBy from 'lodash-es/uniqBy';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { usePanneauResource } from '@panneau/core/contexts';
import type { FormError, Message } from '@panneau/core/types';
import { getPathValue, isMessage } from '@panneau/core/utils';
import { useResourceItems } from '@panneau/data';
import Button from '@panneau/element-button';
import ResourceCard from '@panneau/element-resource-card';
import Select from '@panneau/element-select';
import ResourceForm from '@panneau/form-resource';
import { useResourceValues } from '@panneau/intl';
import Dialog from '@panneau/modal-dialog';
import ModalResourceItems from '@panneau/modal-resource-items';

// TODO:
// Improve the modals (esc key) and switch to FormModal
// Fix the ModalResourceItems usage so it can select an item properly

interface Item {
    id?: string | number | null;
    type?: string;
    [key: string]: unknown;
}

interface SelectOption {
    value: string | number;
    label: string;
}

interface ResourceItemFieldProps {
    name?: string | null;
    value?: Item | null;
    errors?: FormError[] | null;

    resource?: string | null;
    resourceType?: string | null;
    paginated?: boolean;

    query?: Record<string, unknown> | null;
    page?: number | string | null;
    count?: number | string | null;
    options?: Record<string, unknown> | null;
    searchParamName?: string;

    getItemLabel?: ((item: Item, path: string | null) => string) | null;
    getItemDescription?: ((item: Item, path: string | null) => string | null) | null;
    getItemImage?: ((item: Item, path: string | null) => string | null) | null;
    itemLabelPath?: string;
    itemDescriptionPath?: string | null;
    itemImagePath?: string;
    itemLabelWithId?: boolean;

    placeholder?: Message | string | null;
    canCreate?: boolean;
    canEdit?: boolean;
    canFind?: boolean;
    withoutModal?: boolean;
    createButtonLabel?: Message | null;
    editButtonLabel?: Message | null;
    findButtonLabel?: Message | null;
    multiple?: boolean;
    disabled?: boolean;
    className?: string | null;
    inputClassName?: string | null;
    onChange?: ((value: Item | Item[] | null) => void) | null;
}

function ResourceItemField({
    name = null,
    value = null,
    errors = null,
    resource: resourceId = null,
    resourceType = null,
    paginated = true,
    query: initialQuery = null,
    page: initialPage = null,
    count: initialCount = null,
    options: initialOptions = null,
    searchParamName = 'search',
    getItemLabel: initialGetItemLabel = getPathValue,
    getItemDescription = getPathValue,
    getItemImage = getPathValue,
    itemLabelPath = 'label',
    itemDescriptionPath = null,
    itemImagePath = 'image.thumbnail_url',
    itemLabelWithId = false,
    placeholder = null,
    canCreate = false,
    canEdit = false,
    canFind = false,
    withoutModal = false,
    createButtonLabel = null,
    editButtonLabel = null,
    findButtonLabel = null,
    multiple = false,
    disabled = false,
    className = null,
    inputClassName = null,
    onChange = null,
}: ResourceItemFieldProps) {
    const intl = useIntl();
    const resource = usePanneauResource(resourceId);
    const resourceValues = useResourceValues(resource);
    const defaultPage = useMemo(
        () => initialPage || (paginated ? 1 : null),
        [initialPage, paginated],
    );
    const defaultCount = useMemo(
        () => initialCount || (paginated ? 8 : null),
        [initialCount, paginated],
    );
    const hasValue = value !== null && !isEmpty(value);

    // const [initialValue] = useState(value);

    const [formOpen, setFormOpen] = useState(false);
    const [listOpen, setListOpen] = useState(false);

    // TODO: list state controls?
    const [query, setQuery] = useState(initialQuery);
    const [page, setPage] = useState<number | string | null>(defaultPage);
    const [count, setCount] = useState<number | string | null>(defaultCount);
    const [resourceOptions, setOptions] = useState(initialOptions);

    // The text input search query
    const [inputTextValue, setInputTextValue] = useState('');
    const [queryTextValue, setQueryTextValue] = useState('');
    const onInputChange = useCallback(
        (textValue: string) => {
            setInputTextValue(textValue);
            setPage(defaultPage);
        },
        [setInputTextValue, setPage, defaultPage],
    );

    useEffect(() => {
        const id = setTimeout(() => {
            setQueryTextValue(inputTextValue);
        }, 500);
        return () => {
            clearTimeout(id);
        };
    }, [inputTextValue, setQueryTextValue]);

    const queryResource = useMemo(() => ({ id: resourceId }), [resourceId]);
    const finalQuery = useMemo(
        () => ({
            ...query,
            ...(!isEmpty(queryTextValue) ? { [searchParamName]: queryTextValue } : null),
            paginated,
        }),
        [queryTextValue, paginated, query, searchParamName],
    );

    const {
        allItems: partialItems = null,
        reload = null,
        pagination = null,
    } = useResourceItems(
        queryResource,
        finalQuery,
        paginated ? page : null,
        paginated ? count : null,
        resourceOptions,
    );

    const { lastPage = null } = pagination || {};
    const items: Item[] = uniqBy(
        (partialItems || [])
            .concat(multiple && isArray(value) ? value : [value])
            .filter((it: Item | null) => it !== null),
        ({ id = null }: Item) => id,
    );

    const onScrollEnd = useCallback(() => {
        if (
            page !== null &&
            typeof page === 'number' &&
            typeof lastPage === 'number' &&
            page >= lastPage
        ) {
            return;
        }
        if (paginated && typeof page === 'number') {
            setPage(page + 1);
        }
    }, [paginated, page, setPage, lastPage]);

    const getItemLabel = useCallback(
        (it: Item, path: string | null) => {
            const { id = null } = it || {};
            if (itemLabelWithId) {
                const label = initialGetItemLabel(it, path);
                return label ? `${label} (#${id})` : `#${id}`;
            }
            return path !== null ? initialGetItemLabel(it, path) : `#${id}`;
        },
        [initialGetItemLabel, itemLabelWithId],
    );

    const parseItem = useCallback(
        (it: Item): SelectOption => {
            const label = getItemLabel(it, itemLabelPath);
            const description = getItemDescription(it, itemDescriptionPath);
            const finalLabel = description !== null ? `${label}: ${description}` : label;
            return {
                value: it.id as string | number,
                label: finalLabel,
            };
        },
        [getItemLabel, getItemDescription, itemLabelPath, itemDescriptionPath],
    );

    const finalValue =
        multiple && isArray(value) ? value.map(({ id = null }) => id) : value?.id || null;
    const { type: finalType = null } = !multiple && hasValue ? value : { type: resourceType };
    const options: SelectOption[] = (items || []).map((it) => parseItem(it));

    const onValueChange = useCallback(
        (newId: string | number | (string | number)[] | null) => {
            if (onChange === null) return;
            if (multiple && isArray(newId)) {
                const newValue =
                    items.filter(({ id = null }) => newId.indexOf(id as string | number) !== -1) ||
                    [];
                onChange(newValue);
            } else if (!isArray(newId)) {
                const newValue = items.filter(({ id = null }) => id === newId) || [];
                if (newValue !== null && newValue.length > 0) {
                    onChange(newValue[0]);
                } else {
                    onChange(null);
                }
            }
        },
        [items, onChange, multiple],
    );

    const onOpenForm = useCallback(() => {
        setFormOpen(true);
    }, [setFormOpen]);

    const onCloseForm = useCallback(() => {
        setFormOpen(false);
    }, [setFormOpen]);

    const onFormSuccess = useCallback(
        (newValue: Item) => {
            if (onChange === null) return;
            const finalNewValue =
                resourceType !== null ? { type: resourceType, ...newValue } : newValue;
            if (multiple) {
                onChange(isArray(value) ? [...value, finalNewValue] : [finalNewValue]);
            } else {
                onChange(finalNewValue);
            }
            setFormOpen(false);
        },
        [onChange, multiple, value, setFormOpen, resourceType],
    );

    const onOpenList = useCallback(() => {
        setListOpen(false); // TODO: fix this, see Upload Field
    }, [setListOpen]);

    const onCloseList = useCallback(() => {
        setListOpen(false);
    }, [setListOpen]);

    const onSelectListItem = useCallback(
        (newValue: Item) => {
            if (onChange !== null) {
                onChange(newValue);
                setListOpen(false);
            }
        },
        [onChange, setListOpen],
    );

    // If empty try to fetch
    // const onFocus = useCallback(() => {
    //     if ((partialItems || []).length === 0) {
    //         reloadall();
    //     }
    // }, [paginated, reloadall]);

    const onClickRemove = useCallback(() => {
        if (onChange !== null) {
            onChange(null);
        }

        // Clear the page and be good
        if (paginated) {
            setPage(defaultPage);
            if (reload) reload();
        } else {
            if (reload) reload();
        }
    }, [onChange, paginated, defaultPage, reload]);

    const form = formOpen ? (
        <ResourceForm
            resource={resource}
            type={finalType}
            item={!multiple ? value : null}
            onSuccess={onFormSuccess}
            isModal
        />
    ) : null;

    return (
        <div className={classNames(['position-relative', { [className]: className != null }])}>
            {hasValue && !multiple ? (
                <div className="row">
                    <div className="col-10 flex-grow-1">
                        <ResourceCard
                            className="flex-grow-1"
                            item={value}
                            getItemLabel={initialGetItemLabel}
                            getItemDescription={getItemDescription}
                            getItemImage={getItemImage}
                            itemLabelPath={itemLabelPath}
                            itemDescriptionPath={itemDescriptionPath}
                            itemImagePath={itemImagePath}
                            itemLabelWithId={itemLabelWithId}
                            disable={disabled}
                            onClickEdit={
                                canEdit && !multiple ? (formOpen ? onCloseForm : onOpenForm) : null
                            }
                            onClickRemove={onClickRemove}
                            editButtonLabel={editButtonLabel}
                        />
                    </div>
                </div>
            ) : (
                <div className="row align-items-center">
                    <div className="col-8 flex-grow-1">
                        <Select
                            className={classNames([
                                'py-1',
                                'shadow-none',
                                {
                                    [disabled]: disabled,
                                    'is-invalid': errors !== null,
                                    [inputClassName]: inputClassName !== null,
                                },
                            ])}
                            disabled={disabled}
                            name={name}
                            value={finalValue}
                            options={options}
                            isClearable
                            isSearchable
                            placeholder={
                                isMessage(placeholder) ? (
                                    intl.formatMessage(placeholder as Message)
                                ) : (
                                    <FormattedMessage
                                        defaultMessage="Choose an item"
                                        description="Default placeholder"
                                    />
                                )
                            }
                            onChange={onValueChange}
                            onInputChange={onInputChange}
                            // onFocus={onFocus}
                            onMenuScrollToBottom={onScrollEnd}
                            multiple={multiple}
                        />
                    </div>
                    {canFind ? (
                        <div className="col-auto">
                            <Button
                                theme="primary"
                                icon={findButtonLabel === null ? 'search' : null}
                                onClick={listOpen ? onCloseList : onOpenList}
                                outline
                            >
                                {findButtonLabel}
                            </Button>
                        </div>
                    ) : null}
                    {canCreate ? (
                        <div className="col-auto">
                            <Button
                                theme="primary"
                                icon={createButtonLabel === null ? 'plus-lg' : null}
                                onClick={formOpen ? onCloseForm : onOpenForm}
                                outline
                            >
                                {createButtonLabel}
                            </Button>
                        </div>
                    ) : null}
                </div>
            )}
            {formOpen ? (
                withoutModal ? (
                    <div className="card mt-4 p-4">{form}</div>
                ) : (
                    <Dialog
                        id={resourceId}
                        title={
                            hasValue && !multiple ? (
                                <FormattedMessage
                                    values={resourceValues}
                                    defaultMessage="Edit {a_singular}"
                                    description="Page title"
                                />
                            ) : (
                                <FormattedMessage
                                    values={resourceValues}
                                    defaultMessage="Create {a_singular}"
                                    description="Page title"
                                />
                            )
                        }
                        size="lg"
                        onClose={onCloseForm}
                    >
                        {form}
                    </Dialog>
                )
            ) : null}
            {/* Disabled on purpose until fixed */}
            {listOpen ? (
                <ModalResourceItems
                    resource={resourceId}
                    onClose={onCloseList}
                    listProps={{
                        actions: ['select'],
                        actionsProps: { onClickSelect: onSelectListItem },
                    }}
                />
            ) : null}
        </div>
    );
}

export default ResourceItemField;
