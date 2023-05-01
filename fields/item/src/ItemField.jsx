/* eslint-disable no-shadow, react/jsx-props-no-spreading */
import classNames from 'classnames';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import React, { useCallback, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { getPathValue, isMessage } from '@panneau/core/utils';
import { useApi } from '@panneau/data';
import Button from '@panneau/element-button';
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
    autoload: PropTypes.bool,
    disabled: PropTypes.bool,
    className: PropTypes.string,
    inputClassName: PropTypes.string,
    onChange: PropTypes.func,
};

const defaultProps = {
    name: null,
    value: null,
    errors: null,
    items: null,
    maxItemsCount: 5,
    loadItems: null,
    requestUrl: null,
    requestOptions: null,
    requestQuery: null,
    requestSearchParamName: 'search',
    getItemLabel: getPathValue,
    getItemDescription: getPathValue,
    getItemImage: getPathValue,
    itemLabelPath: 'label',
    itemDescriptionPath: null,
    itemImagePath: 'image',
    itemLabelWithId: false,
    size: null,
    placeholder: null,
    autoload: false,
    disabled: false,
    className: null,
    inputClassName: null,
    onChange: null,
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
    requestUrl,
    requestQuery,
    requestOptions,
    requestSearchParamName,
    getItemLabel: initialGetItemLabel,
    getItemDescription,
    getItemImage,
    itemLabelPath,
    itemDescriptionPath,
    itemImagePath,
    itemLabelWithId,
    autoload,
    disabled,
    className,
    inputClassName,
    onChange,
}) => {
    const intl = useIntl();
    const api = useApi();
    const [initialValue] = useState(value);
    const [inputTextValue, setInputTextValue] = useState('');
    const [items, setItems] = useState(initialItems || []);
    const lastRequest = useRef(null);

    const getItemLabel = useCallback(
        (it, path) => {
            if (itemLabelWithId) {
                const label = initialGetItemLabel(it, path);
                const id = get(it, 'id', null);
                return label ? `${label} (#${id})` : `#${id}`;
            }
            return initialGetItemLabel(it, path);
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
                    request !== null ? request.value || inputTextValue : inputTextValue;

                const currentRequest = api.requestGet(
                    requestUrl,
                    {
                        paginated: false,
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
                        const finalNewItems =
                            maxItemsCount !== null ? newItems.slice(0, maxItemsCount) : newItems;
                        setItems(finalNewItems);
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
        ],
    );

    const onClickRemove = useCallback(() => {
        if (onChange !== null) {
            onChange(null);
        }
    }, [onChange]);

    // const onFieldFocus = useCallback(() => {
    //     // getOptions();
    // }, [getOptions]);

    const onInputChange = useCallback((textValue) => {
        setInputTextValue(textValue);
    }, []);

    // const renderSectionTitle = useCallback(
    //     (section) => <h6 className="dropdown-header">{section.title}</h6>,
    //     [],
    // );

    const itemLabel = value !== null ? getItemLabel(value, itemLabelPath) : null;
    const itemDescription = value !== null ? getItemDescription(value, itemDescriptionPath) : null;
    const itemImage = value !== null ? getItemImage(value, itemImagePath) : null;

    // const hasItems = items !== null && items.length > 0;

    // useEffect(() => {
    //     if (!hasItems && autoload) {
    //         // onSuggestionsFetchRequested();
    //     }
    // }, [hasItems, autoload]);
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
            const newValue = items.filter(({ id = null }) => id === newId) || [];
            if (newValue !== null && newValue.length > 0) {
                onChange(newValue[0]);
            } else {
                onChange(null);
            }
        },
        [items, onChange],
    );

    const options = items.map((it) => parseItem(it));

    return (
        <div className={classNames(['position-relative', { [className]: className != null }])}>
            {value !== null ? (
                <div
                    className={classNames([
                        'card',
                        { [`bg-muted`]: disabled, [`text-muted`]: disabled },
                    ])}
                >
                    <div className="card-body p-1 pl-2">
                        <div className="d-flex align-items-center">
                            {itemImage !== null ? (
                                <img
                                    src={itemImage}
                                    alt={itemLabel}
                                    className="flex-shrink-0 me-2"
                                    width="20"
                                />
                            ) : null}
                            <div className="flex-grow-1 ms-1">
                                <h6 className="m-0">{itemLabel}</h6>
                                {!isEmpty(itemDescription) ? (
                                    <p className="m-0">
                                        <small>{itemDescription}</small>
                                    </p>
                                ) : null}
                            </div>
                            <div className="ms-1">
                                <Button
                                    type="button"
                                    size="sm"
                                    theme="secondary"
                                    icon="x-lg"
                                    outline={disabled}
                                    onClick={onClickRemove}
                                    disabled={disabled}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <Select
                    className={classNames([
                        'form-control',
                        'p-0',
                        'shadow-none',
                        {
                            [disabled]: disabled,
                            'is-invalid': errors !== null,
                            [`form-control-${size}`]: size !== null,
                            [inputClassName]: inputClassName !== null,
                        },
                    ])}
                    disabled={disabled}
                    isAsync={requestUrl !== null}
                    defaultOptions={requestUrl !== null && (autoload || initialValue === null)}
                    name={name}
                    value={value}
                    options={options}
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
                    // onFocus={onFieldFocus}
                />
            )}
        </div>
    );
};

ItemField.propTypes = propTypes;
ItemField.defaultProps = defaultProps;

export default ItemField;
