/* eslint-disable no-shadow, react/jsx-props-no-spreading */
import classNames from 'classnames';
import get from 'lodash/get';
import isArray from 'lodash/isArray';
// import isObject from 'lodash/isObject';
// import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import React, { useCallback, useRef, useState } from 'react';
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
    itemLabelPath: PropTypes.string,
    itemDescriptionPath: PropTypes.string,
    itemImagePath: PropTypes.string,
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
    itemLabelPath: 'label',
    itemDescriptionPath: null,
    itemImagePath: 'image.thumbnail_url',
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
    items: initialItems,
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
    itemLabelPath,
    itemDescriptionPath,
    itemImagePath,
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
    const [initialValue] = useState(multiple ? value : null);
    const [inputTextValue, setInputTextValue] = useState('');
    const [items, setItems] = useState(initialItems || initialValue || []);
    const [paginator, setPaginator] = useState(null);
    const [requestQuery, setRequestQuery] = useState(initialRequestQuery || null);

    const lastRequest = useRef(null);

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

    const parseItem = useCallback(
        (it) => {
            const label = getItemLabel(it, itemLabelPath);
            const description = getItemDescription(it, itemDescriptionPath);
            const finalLabel = description !== null ? `${label}: ${description}` : label;

            return {
                value: it.id,
                label: finalLabel,
            };
        },
        [getItemLabel, getItemDescription, itemLabelPath, itemDescriptionPath],
    );

    const getOptions = useCallback(
        (request = null, callback = null) => {
            if (loadItems !== null) {
                const currentRequest = loadItems(request);
                lastRequest.current = currentRequest;
                currentRequest.then((newItems) => {
                    if (currentRequest === lastRequest.current) {
                        setItems(newItems);
                        callback(newItems);
                    }
                });
            } else if (requestUrl !== null) {
                const requestValue =
                    request !== null
                        ? request.value || inputTextValue || null
                        : inputTextValue || null;
                const currentRequest = api.requestGet(
                    requestUrl,
                    {
                        paginated,
                        ...requestQuery,
                        ...(requestValue !== null
                            ? { [requestSearchParamName]: requestValue }
                            : null),
                    },
                    requestOptions, // this is useless
                );
                lastRequest.current = currentRequest;
                currentRequest.then((newItems) => {
                    if (currentRequest === lastRequest.current) {
                        const {
                            data = null,
                            pagination: newPagination = null,
                            meta = null,
                        } = paginated ? newItems : { data: newItems };
                        const finalNewItems =
                            maxItemsCount !== null ? data.slice(0, maxItemsCount) : data;
                        setItems(finalNewItems);
                        if ((paginated && newPagination !== null) || meta !== null) {
                            setPaginator(newPagination || meta || null);
                        }
                        callback(newItems);
                    }
                });
            } else if (initialItems !== null) {
                setItems(initialItems);
                callback(initialItems);
            }
        },
        [
            api,
            loadItems,
            initialItems,
            maxItemsCount,
            inputTextValue,
            requestUrl,
            requestQuery,
            requestOptions,
            requestSearchParamName,
            paginated,
            setPaginator,
        ],
    );

    const onClickRemove = useCallback(() => {
        if (onChange !== null) {
            onChange(null);
        }
    }, [onChange]);

    const onInputChange = useCallback(
        (textValue) => {
            const { page = null } = requestQuery || {};
            if (paginated && page !== null) {
                setRequestQuery({ ...requestQuery, page: 1 });
            }
            setInputTextValue(textValue);
        },
        [paginated, requestQuery, setRequestQuery, setInputTextValue],
    );

    const timeoutRef = useRef(null);
    const loadOptions = useCallback(
        (inputValue, callback) => {
            if (timeoutRef.current !== null) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
                getOptions(inputValue, (newItems) =>
                    callback(newItems !== null ? newItems.map((i) => parseItem(i)) : []),
                );
            }, 300);
        },
        [getOptions],
    );

    const onValueChange = useCallback(
        (newId) => {
            if (onChange === null) return;
            if (multiple) {
                const newValue = items.filter(({ id = null }) => newId.indexOf(id) !== -1) || [];
                onChange(newValue);
            } else {
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

    const options = items.map((it) => parseItem(it));
    const finalValue = multiple && isArray(value) ? value.map((it) => parseItem(it)) : value;

    const { page = null } = requestQuery || {};
    const { lastPage = null, last_page: otherLastPage = null } = paginator || {};
    const finalLastPage = lastPage || otherLastPage || null;

    const onScrollEnd = useCallback(() => {
        if (page !== null && page >= finalLastPage) {
            return;
        }
        if (paginated) {
            setRequestQuery((page || 1) + 1);
        }
    }, [paginated, page, setRequestQuery, finalLastPage]);

    const onCreateOption = useCallback(
        (newValue) => {
            if (onCreate instanceof Promise) {
                onCreate(newValue).then((newValue) => {
                    loadOptions();
                    return newValue;
                });
            } else {
                onCreate(newValue);
            }
        },
        [onCreate, loadOptions],
    );

    // const renderSectionTitle = useCallback(
    //     (section) => <h6 className="dropdown-header">{section.title}</h6>,
    //     [],
    // );

    // const onFieldFocus = useCallback(() => {
    //     if (items.length === 0) {
    //         getOptions();
    //     }
    // }, [items, getOptions]);

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
                            isAsync={requestUrl !== null}
                            defaultOptions={requestUrl !== null}
                            name={name}
                            value={finalValue}
                            options={options}
                            creatable={creatable}
                            onCreateOption={onCreateOption}
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
                            onInputChange={onInputChange}
                            loadOptions={loadOptions}
                            onMenuScrollToBottom={paginated ? onScrollEnd : null}
                            multiple={multiple}
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
