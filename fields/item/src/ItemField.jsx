/* eslint-disable no-shadow, react/jsx-props-no-spreading */
import classNames from 'classnames';
import get from 'lodash/get';
import isString from 'lodash/isString';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { getPathValue, isMessage } from '@panneau/core/utils';
import { useApi } from '@panneau/data';
import ResourceCard from '@panneau/element-resource-card';
import Select from '@panneau/element-select';

const propTypes = {
    name: PropTypes.string,
    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    errors: PanneauPropTypes.formErrors,
    items: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
        }),
    ),
    maxItemsCount: PropTypes.number,
    loadItems: PropTypes.func,
    paginated: PropTypes.bool,
    requestUrl: PropTypes.string,
    requestOptions: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    requestQuery: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    requestSearchParamName: PropTypes.string,
    getItemLabel: PropTypes.func,
    getItemDescription: PropTypes.func,
    getItemImage: PropTypes.func,
    getItemId: PropTypes.func,
    getNewItem: PropTypes.func,
    itemLabelPath: PropTypes.string,
    itemDescriptionPath: PropTypes.string,
    itemImagePath: PropTypes.string,
    itemIdPath: PropTypes.string,
    itemLabelWithId: PropTypes.bool,
    size: PropTypes.oneOf(['sm', 'lg']),
    placeholder: PropTypes.string,
    creatable: PropTypes.bool,
    multiple: PropTypes.bool,
    disabled: PropTypes.bool,
    isRow: PropTypes.bool,
    className: PropTypes.string,
    inputClassName: PropTypes.string,
    onChange: PropTypes.func,
    onCreate: PropTypes.func,
};

const defaultProps = {
    name: null,
    value: null,
    errors: null,
    items: null,
    maxItemsCount: null,
    loadItems: null,
    paginated: false,
    requestUrl: null,
    requestOptions: null,
    requestQuery: null,
    requestSearchParamName: 'search',
    getItemLabel: getPathValue,
    getItemDescription: getPathValue,
    getItemImage: getPathValue,
    getItemId: getPathValue,
    getNewItem: null,
    itemLabelPath: 'label',
    itemDescriptionPath: null,
    itemImagePath: 'image.thumbnail_url',
    itemIdPath: 'id',
    itemLabelWithId: false,
    size: null,
    placeholder: null,
    creatable: false,
    multiple: false,
    disabled: false,
    isRow: false,
    className: null,
    inputClassName: null,
    onChange: null,
    onCreate: null,
};

const ItemField = ({
    name,
    value,
    errors,
    size,
    placeholder,
    items,
    maxItemsCount,
    loadItems,
    paginated,
    requestUrl,
    requestQuery: initialRequestQuery,
    requestOptions,
    requestSearchParamName,
    getItemLabel: initialGetItemLabel,
    getItemDescription,
    getItemImage,
    getItemId,
    getNewItem,
    itemLabelPath,
    itemDescriptionPath,
    itemImagePath,
    itemIdPath,
    itemLabelWithId,
    creatable,
    multiple,
    disabled,
    isRow,
    className,
    inputClassName,
    onChange,
    onCreate,
}) => {
    const intl = useIntl();
    const api = useApi();
    const [initialValue] = useState(value || null);
    const [inputTextValue, setInputTextValue] = useState('');

    // const [paginator] = useState(null);
    const [requestQuery] = useState(initialRequestQuery || null);
    const [createdItems, setCreatedItems] = useState(null);

    const isAsync = loadItems !== null || requestUrl !== null;

    const getItemLabel = useCallback(
        (it, path) => {
            const id = get(it, 'id', null);
            if (itemLabelWithId) {
                const label = initialGetItemLabel(it, path);
                return label ? `${label} (#${id})` : `#${id}`;
            }
            return path !== null ? initialGetItemLabel(it, path) : `#${id}`;
        },
        [initialGetItemLabel, itemLabelWithId],
    );

    const getOptionValue = useCallback(
        (it) => {
            const { label: newLabel = null, __isNew__: isNew = false } = it || {};
            if (isNew) {
                return newLabel;
            }
            return isString(it) ? it : getItemId(it, itemIdPath);
        },
        [getItemId, itemIdPath],
    );

    const getOptionLabel = useCallback(
        (it) => {
            if (isString(it)) {
                return it;
            }
            const { label: newLabel = null, __isNew__: isNew = false } = it || {};
            if (isNew) {
                return newLabel;
            }
            const label = getItemLabel(it, itemLabelPath);
            const description = getItemDescription(it, itemDescriptionPath);
            return description !== null ? `${label}: ${description}` : label;
        },
        [getItemLabel, itemLabelPath, getItemDescription, itemDescriptionPath],
    );

    const getOptions = useCallback(
        (newItems) => [...(newItems || []), ...(createdItems || [])],
        [initialValue, createdItems],
    );

    const fetchOptions = useCallback(
        (requestValue) => {
            if (loadItems !== null) {
                return loadItems(requestValue).then((newItems) => getOptions(newItems));
            }
            return api
                .requestGet(
                    requestUrl,
                    {
                        paginated,
                        ...requestQuery,
                        ...(requestValue !== null
                            ? { [requestSearchParamName]: requestValue }
                            : null),
                    },
                    requestOptions,
                )
                .then((newItems) => {
                    const { data = null } = paginated ? newItems : { data: newItems };
                    const finalNewItems =
                        maxItemsCount !== null ? data.slice(0, maxItemsCount) : data;
                    return getOptions(finalNewItems);
                });
        },
        [
            api,
            loadItems,
            maxItemsCount,
            inputTextValue,
            requestUrl,
            requestQuery,
            requestOptions,
            requestSearchParamName,
            paginated,
            getOptions,
        ],
    );

    const onClickRemove = useCallback(() => {
        if (onChange !== null) {
            onChange(null);
        }
    }, [onChange]);

    const onInputChange = useCallback(
        (textValue) => {
            setInputTextValue(textValue);
        },
        [paginated, requestQuery, setInputTextValue],
    );

    // TODO: add a little debounce here
    // const timeoutRef = useRef(null);
    const loadOptions = useCallback((inputValue) => fetchOptions(inputValue), [fetchOptions]);

    // const { page = null } = requestQuery || {};
    // const { lastPage = null, last_page: otherLastPage = null } = paginator || {};
    // const finalLastPage = lastPage || otherLastPage || null;

    // const onScrollEnd = useCallback(() => {
    //     if (page !== null && page >= finalLastPage) {
    //         return null;
    //     }
    //     return null;
    //     // if (paginated) {
    //     //     setRequestQuery((page || 1) + 1);
    //     // }
    // }, [paginated, page, setRequestQuery, finalLastPage]);

    const onValueChange = useCallback(
        (newValue) => {
            if (onChange === null) return;
            // console.log('onChange', newValue);
            onChange(newValue);
            setInputTextValue('');
        },
        [items, onChange, multiple, itemLabelPath, getItemLabel, setInputTextValue],
    );

    const onCreateOption = useCallback(
        (newLabel) => {
            const newItem = getNewItem !== null ? getNewItem(newLabel) : newLabel;
            // console.log('newLabel', newLabel, 'newItem', newItem);

            setCreatedItems([...(createdItems || []), newItem]);
            if (multiple) {
                onChange([...(value || []), newItem]);
            } else {
                onChange(newItem);
            }
        },
        [onChange, createdItems, getNewItem, setCreatedItems],
    );

    const options = useMemo(
        () => (!isAsync ? getOptions(items) : null),
        [items, getOptions, isAsync],
    );

    // console.log('value', value, 'options', options);

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
                            isAsync={isAsync}
                            defaultOptions={isAsync} // Always uses loadOptions
                            name={name}
                            value={value}
                            creatable={creatable}
                            onCreateOption={creatable ? onCreate || onCreateOption : null}
                            isClearable
                            isSearchable
                            placeholder={
                                isMessage(placeholder) ? (
                                    intl.formatMessage(placeholder)
                                ) : (
                                    <FormattedMessage
                                        defaultMessage="Choose an item"
                                        description="Default placeholder"
                                    />
                                )
                            }
                            onChange={onValueChange}
                            getOptionValue={getOptionValue}
                            getOptionLabel={getOptionLabel}
                            inputValue={inputTextValue}
                            onInputChange={onInputChange}
                            loadOptions={loadOptions}
                            // onMenuScrollToBottom={paginated ? onScrollEnd : null}
                            multiple={multiple}
                            // getNewOptionData={(label, formattedLabel) => ({ label, isNew: true })}
                            {...(!isAsync && options !== null && options.length > 0
                                ? { options }
                                : null)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

ItemField.propTypes = propTypes;
ItemField.defaultProps = defaultProps;

export default ItemField;
