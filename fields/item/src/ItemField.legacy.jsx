/* eslint-disable no-shadow, react/jsx-props-no-spreading */
import classNames from 'classnames';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import React, { useCallback, useRef, useState } from 'react';
import Autosuggest from 'react-autosuggest';
import { useIntl } from 'react-intl';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { getPathValue, isMessage } from '@panneau/core/utils';
import { useApi } from '@panneau/data';
import Button from '@panneau/element-button';

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
    disabled,
    className,
    inputClassName,
    onChange,
}) => {
    const intl = useIntl();
    const api = useApi();
    const [inputValue, setInputValue] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
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

    const onSuggestionsFetchRequested = useCallback(
        (request) => {
            if (loadItems !== null) {
                const currentRequest = loadItems(request);
                lastRequest.current = currentRequest;
                currentRequest.then((newItems) => {
                    if (currentRequest === lastRequest.current) {
                        setItems(newItems);
                    }
                });
            } else if (requestUrl !== null) {
                const currentRequest = api.requestGet(
                    requestUrl,
                    {
                        ...requestQuery,
                        [requestSearchParamName]: request.value,
                    },
                    requestOptions,
                );
                lastRequest.current = currentRequest;
                currentRequest.then((newItems) => {
                    if (currentRequest === lastRequest.current) {
                        setItems(
                            maxItemsCount !== null ? newItems.slice(0, maxItemsCount) : newItems,
                        );
                    }
                });
            } else if (initialItems !== null) {
                setItems(initialItems);
            }
        },
        [
            api,
            loadItems,
            initialItems,
            maxItemsCount,
            requestUrl,
            requestQuery,
            requestOptions,
            requestSearchParamName,
        ],
    );

    const onSuggestionsClearRequested = useCallback(() => {
        setItems([]);
    }, [setItems]);

    const onInputChange = useCallback(
        (e, { newValue }) => {
            setInputValue(newValue);
        },
        [setInputValue],
    );

    const onSuggestionSelected = useCallback(
        (e, { suggestion }) => {
            setInputValue('');
            if (onChange !== null) {
                onChange(suggestion);
            }
        },
        [setInputValue, onChange],
    );

    const onClickRemove = useCallback(() => {
        setInputValue('');
        setShowSuggestions(false);
        if (onChange !== null) {
            onChange(null);
        }
    }, [setInputValue, onChange]);

    const renderSuggestion = useCallback(
        (suggestion, { isHighlighted }) => {
            const label = getItemLabel(suggestion, itemLabelPath);
            const description = getItemDescription(suggestion, itemDescriptionPath);
            return (
                <button
                    type="button"
                    className={classNames([
                        'dropdown-item',
                        {
                            active: isHighlighted,
                        },
                    ])}
                >
                    {label}
                    {description !== null ? (
                        <small className="d-block text-muted">{description}</small>
                    ) : null}
                </button>
            );
        },
        [getItemLabel, itemLabelPath, getItemDescription, itemDescriptionPath],
    );

    const renderSectionTitle = useCallback(
        (section) => <h6 className="dropdown-header">{section.title}</h6>,
        [],
    );

    const inputProps = {
        placeholder: isMessage(placeholder) ? intl.formatMessage(placeholder) : placeholder,
        value: inputValue || '',
        name,
        type: 'search',
        onChange: onInputChange,
    };

    const getSuggestionValue = useCallback(
        (suggestion) => getItemLabel(suggestion, itemLabelPath),
        [getItemLabel, itemLabelPath],
    );

    const toggleSuggestions = useCallback(() => {
        setShowSuggestions(!showSuggestions);
    }, [showSuggestions, setShowSuggestions]);

    const itemLabel = value !== null ? getItemLabel(value, itemLabelPath) : null;
    const itemDescription = value !== null ? getItemDescription(value, itemDescriptionPath) : null;
    const itemImage = value !== null ? getItemImage(value, itemImagePath) : null;

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
                                    outline
                                    onClick={onClickRemove}
                                    disabled={disabled}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <Autosuggest
                        suggestions={items}
                        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                        onSuggestionsClearRequested={onSuggestionsClearRequested}
                        onSuggestionSelected={onSuggestionSelected}
                        getSuggestionValue={getSuggestionValue}
                        renderSuggestion={renderSuggestion}
                        renderSectionTitle={renderSectionTitle}
                        renderInputComponent={(inputProps) => (
                            <input {...inputProps} disabled={disabled} />
                        )}
                        inputProps={inputProps}
                        alwaysRenderSuggestions={showSuggestions}
                        theme={{
                            container: 'position-relative',
                            containerOpen: 'show',
                            input: classNames([
                                'form-control',
                                {
                                    [`disabled`]: disabled,
                                    'is-invalid': errors !== null,
                                    [`form-control-${size}`]: size !== null,
                                    [inputClassName]: inputClassName !== null,
                                },
                            ]),
                            suggestionsContainer: 'dropdown-menu',
                            suggestionsContainerOpen: 'show',
                            suggestionsList: 'list-unstyled m-0 p-0',
                            suggestion: 'm-0 p-0',
                        }}
                    />
                    {!disabled ? (
                        <div className="position-absolute top-0 end-0 ms-1 me-1 mt-1">
                            <Button
                                type="button"
                                size="sm"
                                theme="secondary"
                                icon="caret-down-fill"
                                outline
                                onClick={toggleSuggestions}
                                className="border-light"
                                disabled={disabled}
                            />
                        </div>
                    ) : null}
                </>
            )}
        </div>
    );
};

ItemField.propTypes = propTypes;
ItemField.defaultProps = defaultProps;

export default ItemField;
