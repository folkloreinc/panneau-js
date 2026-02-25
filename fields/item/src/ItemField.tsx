import classNames from 'classnames';
import isString from 'lodash/isString';
import { useCallback, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import type { ControlSize, Message } from '@panneau/core';
import { getPathValue, isMessage } from '@panneau/core/utils';
import ResourceCard from '@panneau/element-resource-card';
import Select from '@panneau/field-select';

interface ItemFieldItem {
    id: string;
    [key: string]: unknown;
}

interface ItemFieldProps {
    name?: string | null;
    value?: ItemFieldItem | ItemFieldItem[] | null;
    errors?: string | string[] | null;
    items?: ItemFieldItem[] | null;
    maxItemsCount?: number | null;
    loadItems?: ((requestValue: string) => Promise<ItemFieldItem[]>) | null;
    paginated?: boolean;
    requestUrl?: string | null;
    requestQuery?: Record<string, unknown> | null;
    requestOptions?: Record<string, unknown> | null;
    requestSearchParamName?: string;
    getItemLabel?: ((item: ItemFieldItem, path: string | null) => string) | null;
    getItemDescription?: ((item: ItemFieldItem, path: string | null) => string | null) | null;
    getItemImage?: ((item: ItemFieldItem, path: string | null) => string | null) | null;
    getItemId?: ((item: ItemFieldItem, path: string | null) => string) | null;
    getNewItem?: ((label: string) => ItemFieldItem | string) | null;
    itemLabelPath?: string;
    itemDescriptionPath?: string | null;
    itemImagePath?: string;
    itemIdPath?: string;
    itemLabelWithId?: boolean;
    size?: ControlSize;
    placeholder?: string | Message | null;
    creatable?: boolean;
    multiple?: boolean;
    autoSize?: boolean;
    disabled?: boolean;
    isRow?: boolean;
    className?: string | null;
    inputClassName?: string | null;
    onChange?: ((value: ItemFieldItem | ItemFieldItem[] | null) => void) | null;
    onCreate?: ((label: string) => void) | null;
}

function ItemField({
    name = null,
    value = null,
    errors = null,
    size = null,
    placeholder = null,
    items = null,
    maxItemsCount = null,
    loadItems = null,
    paginated = false,
    requestUrl = null,
    requestQuery = null,
    requestOptions = null,
    requestSearchParamName = 'search',
    getItemLabel: initialGetItemLabel = getPathValue,
    getItemDescription = getPathValue,
    getItemImage = getPathValue,
    getItemId = getPathValue,
    getNewItem = null,
    itemLabelPath = 'label',
    itemDescriptionPath = null,
    itemImagePath = 'image.thumbnail_url',
    itemIdPath = 'id',
    itemLabelWithId = false,
    creatable = false,
    multiple = false,
    autoSize = false,
    disabled = false,
    isRow = false,
    className = null,
    inputClassName = null,
    onChange = null,
    onCreate = null,
}: ItemFieldProps) {
    const intl = useIntl();
    const [initialValue] = useState(value || null);

    const [createdItems, setCreatedItems] = useState<ItemFieldItem[] | null>(null);

    const getItemLabel = useCallback(
        (it: ItemFieldItem, path: string | null) => {
            const id = getItemId !== null ? getItemId(it, itemIdPath) : null;
            if (itemLabelWithId) {
                const label = initialGetItemLabel(it, path);
                return label ? `${label} (#${id})` : `#${id}`;
            }
            return path !== null ? initialGetItemLabel(it, path) : `#${id}`;
        },
        [initialGetItemLabel, itemLabelWithId, getItemId, itemIdPath],
    );

    const getOptionValue = useCallback(
        (it: ItemFieldItem | string | { value?: string; __isNew__?: boolean }) => {
            if (isString(it)) {
                return it;
            }
            const { value: newValue, __isNew__: isNew = false } =
                (it as {
                    value?: string;
                    __isNew__?: boolean;
                }) || {};
            if (isNew) {
                return newValue || '';
            }
            return getItemId !== null ? getItemId(it as ItemFieldItem, itemIdPath) : '';
        },
        [getItemId, itemIdPath],
    );

    const getOptionLabel = useCallback(
        (it: ItemFieldItem | string | { label?: string; __isNew__?: boolean }) => {
            if (isString(it)) {
                return it;
            }
            const { label: newLabel, __isNew__: isNew = false } =
                (it as {
                    label?: string;
                    __isNew__?: boolean;
                }) || {};
            if (isNew) {
                return newLabel || '';
            }
            const label = getItemLabel(it as ItemFieldItem, itemLabelPath);
            const description =
                getItemDescription !== null
                    ? getItemDescription(it as ItemFieldItem, itemDescriptionPath)
                    : null;
            return description !== null ? `${label}: ${description}` : label;
        },
        [getItemLabel, itemLabelPath, getItemDescription, itemDescriptionPath],
    );

    const getOptions = useCallback(
        (newItems: ItemFieldItem[] | null) => [...(newItems || []), ...(createdItems || [])],
        [createdItems],
    );

    const loadOptions = useMemo(
        () =>
            loadItems !== null
                ? (requestValue: string) =>
                      loadItems(requestValue).then((newItems) => getOptions(newItems))
                : null,
        [loadItems, getOptions],
    );

    const onClickRemove = useCallback(() => {
        if (onChange !== null) {
            onChange(null);
        }
    }, [onChange]);

    const onCreateOption = useCallback(
        (newLabel: string) => {
            const newItem =
                getNewItem !== null ? getNewItem(newLabel) : (newLabel as unknown as ItemFieldItem);
            setCreatedItems([...(createdItems || []), newItem as ItemFieldItem]);
            if (onChange !== null) {
                onChange(
                    multiple
                        ? [...((value as ItemFieldItem[]) || []), newItem as ItemFieldItem]
                        : (newItem as ItemFieldItem),
                );
            }
        },
        [onChange, createdItems, getNewItem, setCreatedItems, multiple, value],
    );

    const options = useMemo(() => (items !== null ? getOptions(items) : null), [items, getOptions]);

    return (
        <div className={classNames(['position-relative', { [className]: className != null }])}>
            {value !== null && !multiple ? (
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
                    disabled={disabled}
                    onClickRemove={onClickRemove}
                />
            ) : (
                <div className={classNames([{ row: isRow, 'align-items-center': isRow }])}>
                    <div className="col-auto flex-grow-1">
                        <Select
                            className={classNames([
                                'py-1',
                                'shadow-none',
                                {
                                    [disabled]: disabled,
                                    'is-invalid': errors !== null,
                                    [`form-control`]: size !== null,
                                    [`form-control-${size}`]: size !== null,
                                    [inputClassName]: inputClassName !== null,
                                },
                            ])}
                            disabled={disabled}
                            name={name}
                            value={value}
                            maxOptionsCount={maxItemsCount}
                            paginated={paginated}
                            requestUrl={requestUrl}
                            requestQuery={requestQuery}
                            requestOptions={requestOptions}
                            requestSearchParamName={requestSearchParamName}
                            creatable={creatable}
                            onCreateOption={creatable ? onCreate || onCreateOption : null}
                            isClearable
                            isSearchable
                            placeholder={
                                isMessage(placeholder)
                                    ? intl.formatMessage(placeholder as Message)
                                    : placeholder || (
                                          <FormattedMessage
                                              defaultMessage="Choose an item"
                                              description="Default placeholder"
                                          />
                                      )
                            }
                            onChange={onChange}
                            getOptionValue={getOptionValue}
                            getOptionLabel={getOptionLabel}
                            prepareRequestOptions={getOptions}
                            loadOptions={loadOptions}
                            multiple={multiple}
                            autoSize={autoSize}
                            valueIsOption
                            {...(options !== null ? { options } : null)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default ItemField;
