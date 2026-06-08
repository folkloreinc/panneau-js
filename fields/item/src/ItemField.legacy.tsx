import classNames from 'classnames';
import get from 'lodash-es/get';
import isEmpty from 'lodash-es/isEmpty';
import type { FormEvent } from 'react';
import { useCallback, useRef, useState } from 'react';
import Autosuggest from 'react-autosuggest';
import { useIntl } from 'react-intl';

import type { ControlSize, Message } from '@panneau/core';
import { getPathValue, isMessage } from '@panneau/core/utils';
import { useApi } from '@panneau/data';
import Button from '@panneau/element-button';

interface ItemFieldItem {
    id: string;
    [key: string]: unknown;
}

interface ItemFieldLegacyProps {
    name?: string | null;
    value?: ItemFieldItem | null;
    errors?: string | string[] | null;
    items?: ItemFieldItem[] | null;
    maxItemsCount?: number;
    loadItems?: ((request: { value: string }) => Promise<ItemFieldItem[]>) | null;
    requestUrl?: string | null;
    requestOptions?: Record<string, unknown> | null;
    requestQuery?: Record<string, unknown> | null;
    requestSearchParamName?: string;
    getItemLabel?: ((item: ItemFieldItem, path: string | null) => string) | null;
    getItemDescription?: ((item: ItemFieldItem, path: string | null) => string | null) | null;
    getItemImage?: ((item: ItemFieldItem, path: string | null) => string | null) | null;
    itemLabelPath?: string;
    itemDescriptionPath?: string | null;
    itemImagePath?: string;
    itemLabelWithId?: boolean;
    size?: ControlSize;
    placeholder?: string | Message | null;
    disabled?: boolean;
    className?: string | null;
    inputClassName?: string | null;
    onChange?: ((value: ItemFieldItem | null) => void) | null;
}

function ItemField({
    name = null,
    value = null,
    errors = null,
    size = null,
    placeholder = null,
    items: initialItems = null,
    maxItemsCount = 5,
    loadItems = null,
    requestUrl = null,
    requestQuery = null,
    requestOptions = null,
    requestSearchParamName = 'search',
    getItemLabel: initialGetItemLabel = getPathValue,
    getItemDescription = getPathValue,
    getItemImage = getPathValue,
    itemLabelPath = 'label',
    itemDescriptionPath = null,
    itemImagePath = 'image',
    itemLabelWithId = false,
    disabled = false,
    className = null,
    inputClassName = null,
    onChange = null,
}: ItemFieldLegacyProps) {
    const intl = useIntl();
    const api = useApi();
    const [inputValue, setInputValue] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [items, setItems] = useState<ItemFieldItem[]>(initialItems || []);
    const lastRequest = useRef<Promise<ItemFieldItem[]> | null>(null);

    const getItemLabel = useCallback(
        (it: ItemFieldItem, path: string | null) => {
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
        (request: { value: string }) => {
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
                currentRequest.then((newItems: ItemFieldItem[]) => {
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
        (e: FormEvent, { newValue }: { newValue: string }) => {
            setInputValue(newValue);
        },
        [setInputValue],
    );

    const onSuggestionSelected = useCallback(
        (e: FormEvent, { suggestion }: { suggestion: ItemFieldItem }) => {
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
        (suggestion: ItemFieldItem, { isHighlighted }: { isHighlighted: boolean }) => {
            const label = getItemLabel(suggestion, itemLabelPath);
            const description =
                getItemDescription !== null
                    ? getItemDescription(suggestion, itemDescriptionPath)
                    : null;
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
        (section: { title: string }) => <h6 className="dropdown-header">{section.title}</h6>,
        [],
    );

    const inputProps = {
        placeholder: isMessage(placeholder)
            ? intl.formatMessage(placeholder as Message)
            : placeholder || '',
        value: inputValue || '',
        name: name || '',
        type: 'search' as const,
        onChange: onInputChange,
    };

    const getSuggestionValue = useCallback(
        (suggestion: ItemFieldItem) => getItemLabel(suggestion, itemLabelPath),
        [getItemLabel, itemLabelPath],
    );

    const toggleSuggestions = useCallback(() => {
        setShowSuggestions(!showSuggestions);
    }, [showSuggestions, setShowSuggestions]);

    const itemLabel = value !== null ? getItemLabel(value, itemLabelPath) : null;
    const itemDescription =
        value !== null && getItemDescription !== null
            ? getItemDescription(value, itemDescriptionPath)
            : null;
    const itemImage =
        value !== null && getItemImage !== null ? getItemImage(value, itemImagePath) : null;

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
                                    alt={itemLabel || ''}
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
}

export default ItemField;
