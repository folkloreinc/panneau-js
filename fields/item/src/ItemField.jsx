/* eslint-disable no-shadow, react/jsx-props-no-spreading */
import classNames from 'classnames';
import isString from 'lodash-es/isString';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { getPathValue, isMessage } from '@panneau/core/utils';
import ResourceCard from '@panneau/element-resource-card';
import Select from '@panneau/field-select';

const propTypes = {
    name: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.object, PropTypes.array]), // eslint-disable-line react/forbid-prop-types
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
    autoSize: PropTypes.bool,
    disabled: PropTypes.bool,
    isRow: PropTypes.bool,
    className: PropTypes.string,
    inputClassName: PropTypes.string,
    onChange: PropTypes.func,
    onCreate: PropTypes.func,
};

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
    onCreate = null
}) {
    const intl = useIntl();
    const [initialValue] = useState(value || null);

    const [createdItems, setCreatedItems] = useState(null);

    const getItemLabel = useCallback(
        (it, path) => {
            const id = getItemId(it, itemIdPath);
            if (itemLabelWithId) {
                const label = initialGetItemLabel(it, path);
                return label ? `${label} (#${id})` : `#${id}`;
            }
            return path !== null ? initialGetItemLabel(it, path) : `#${id}`;
        },
        [initialGetItemLabel, itemLabelWithId, getItemId, itemIdPath],
    );

    const getOptionValue = useCallback(
        (it) => {
            if (isString(it)) {
                return it;
            }
            const { value: newValue, __isNew__: isNew = false } = it || {};
            if (isNew) {
                return newValue;
            }
            return getItemId(it, itemIdPath);
        },
        [getItemId, itemIdPath],
    );

    const getOptionLabel = useCallback(
        (it) => {
            if (isString(it)) {
                return it;
            }
            const { label: newLabel, __isNew__: isNew = false } = it || {};
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

    const loadOptions = useMemo(
        () =>
            loadItems !== null
                ? (requestValue) => loadItems(requestValue).then((newItems) => getOptions(newItems))
                : null,
        [getOptions],
    );

    const onClickRemove = useCallback(() => {
        if (onChange !== null) {
            onChange(null);
        }
    }, [onChange]);

    const onCreateOption = useCallback(
        (newLabel) => {
            const newItem = getNewItem !== null ? getNewItem(newLabel) : newLabel;
            setCreatedItems([...(createdItems || []), newItem]);
            if (onChange !== null) {
                onChange(multiple ? [...(value || []), newItem] : newItem);
            }
        },
        [onChange, createdItems, getNewItem, setCreatedItems],
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
                                    ? intl.formatMessage(placeholder)
                                    : placeholder || (
                                          // eslint-disable-next-line react/jsx-indent
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

ItemField.propTypes = propTypes;

export default ItemField;
