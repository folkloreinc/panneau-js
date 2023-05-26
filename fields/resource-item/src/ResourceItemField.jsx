/* eslint-disable no-nested-ternary */

/* eslint-disable no-shadow, react/jsx-props-no-spreading */
import classNames from 'classnames';
import get from 'lodash/get';
import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { usePanneauResource } from '@panneau/core/contexts';
import { getPathValue, isMessage } from '@panneau/core/utils';
import { useResourceItems } from '@panneau/data';
import Button from '@panneau/element-button';
import ResourceCard from '@panneau/element-resource-card';
import Select from '@panneau/element-select';
import ResourceForm from '@panneau/form-resource';
import { useResourceValues } from '@panneau/intl';
import Dialog from '@panneau/modal-dialog';

const propTypes = {
    name: PropTypes.string,
    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    errors: PanneauPropTypes.formErrors,

    resource: PropTypes.string,
    resourceType: PropTypes.string,

    query: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    page: PropTypes.oneOfType([PropTypes.number, PropTypes.string]), // eslint-disable-line react/forbid-prop-types
    count: PropTypes.oneOfType([PropTypes.number, PropTypes.string]), // eslint-disable-line react/forbid-prop-types
    options: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    searchParamName: PropTypes.string,

    getItemLabel: PropTypes.func,
    getItemDescription: PropTypes.func,
    getItemImage: PropTypes.func,
    itemLabelPath: PropTypes.string,
    itemDescriptionPath: PropTypes.string,
    itemImagePath: PropTypes.string,
    itemLabelWithId: PropTypes.bool,

    placeholder: PropTypes.string,
    canCreate: PropTypes.bool,
    createInPlace: PropTypes.bool,
    multiple: PropTypes.bool,
    disabled: PropTypes.bool,
    className: PropTypes.string,
    inputClassName: PropTypes.string,
    onChange: PropTypes.func,
};

const defaultProps = {
    name: null,
    value: null,
    errors: null,

    resource: null,
    resourceType: null,

    query: null,
    page: null,
    count: null,
    options: null,
    searchParamName: 'search',

    getItemLabel: getPathValue,
    getItemDescription: getPathValue,
    getItemImage: getPathValue,
    itemLabelPath: 'label',
    itemDescriptionPath: null,
    itemImagePath: 'image',
    itemLabelWithId: false,

    placeholder: null,
    canCreate: false,
    createInPlace: false,
    multiple: false,
    disabled: false,
    className: null,
    inputClassName: null,
    onChange: null,
};

const ResourceItemField = ({
    name,
    value,
    errors,

    resource: resourceId,
    resourceType,
    query: initialQuery,
    page: initialPage,
    count: initialCount,
    options: initialOptions,
    searchParamName,

    getItemLabel: initialGetItemLabel,
    getItemDescription,
    getItemImage,
    itemLabelPath,
    itemDescriptionPath,
    itemImagePath,
    itemLabelWithId,

    placeholder,
    canCreate,
    createInPlace,
    multiple,
    disabled,
    className,
    inputClassName,
    onChange,
}) => {
    const intl = useIntl();
    // const [initialValue] = useState(value);
    const [query, setQuery] = useState(initialQuery);
    const [page, setPage] = useState(initialPage);
    const [count, setCount] = useState(initialCount);
    const [resourceOptions, setOptions] = useState(initialOptions);

    // The create option
    const [createOpen, setCreateOpen] = useState(initialCount);

    // The search query
    const [inputTextValue, setInputTextValue] = useState('');

    const resource = usePanneauResource(resourceId);
    const resourceValues = useResourceValues(resource);

    const queryResource = useMemo(() => ({ id: resourceId }), [resourceId]);
    const finalQuery = useMemo(
        () => ({
            ...query,
            ...(!isEmpty(inputTextValue) ? { [searchParamName]: inputTextValue } : null),
            paginated: false, // TODO: implement this...
        }),
        [inputTextValue],
    );

    // console.log('resource', resourceId, resource);

    const resourceItems = useResourceItems(queryResource, finalQuery, page, count, resourceOptions);
    const { items: partialItems = null } = resourceItems || {};
    const items = (partialItems || [])
        .concat(multiple && isArray(value) ? value : [value])
        .filter((it) => it !== null);

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

    const partialValue =
        multiple && isArray(value) ? value.map((it) => parseItem(it)) : value || null;

    const finalValue =
        multiple && isArray(partialValue)
            ? partialValue.map(({ id = null }) => id)
            : value?.id || null;

    const options = (items || []).map((it) => parseItem(it));

    // TODO: filter duplicate IDs blabla
    // const { id: valueId = null } = value || {};
    // const filteredItems =
    //     responseItems !== null && valueId !== null
    //         ? responseItems.filter((it) => (it !== null && it.id ? it.id !== valueId : true))
    //         : responseItems || [];
    // const arrayedValue = multiple ? value : [value];
    // const items = [...filteredItems, ...(value !== null ? arrayedValue : [])];
    // console.log(options, items, value, finalValue, onChange);
    // console.log('ultimate', options, finalValue);

    const onInputChange = useCallback((textValue) => {
        setInputTextValue(textValue);
    }, []);

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

    const onOpenCreate = useCallback(() => {
        setCreateOpen(true);
    }, [setCreateOpen]);

    const onCloseCreate = useCallback(() => {
        setCreateOpen(false);
    }, [setCreateOpen]);

    const onCreateSuccess = useCallback(
        (newValue) => {
            if (onChange === null) return;
            const finalNewValue =
                resourceType !== null ? { type: resourceType, ...newValue } : newValue;
            if (multiple) {
                onChange(
                    value !== null && isArray(value) ? [...value, finalNewValue] : [finalNewValue],
                );
            } else {
                onChange(finalNewValue);
            }
            setCreateOpen(false);
        },
        [onChange, multiple, value, setCreateOpen, resourceType],
    );

    const onClickRemove = useCallback(() => {
        if (onChange !== null) {
            onChange(null);
        }
    }, [onChange]);

    return (
        <div className={classNames(['position-relative', { [className]: className != null }])}>
            {value !== null && !multiple ? (
                <ResourceCard
                    item={value}
                    getItemLabel={initialGetItemLabel}
                    getItemDescription={getItemDescription}
                    getItemImage={getItemImage}
                    itemLabelPath={itemLabelPath}
                    itemDescriptionPath={itemDescriptionPath}
                    itemImagePath={itemImagePath}
                    itemLabelWithId={itemLabelWithId}
                    disable={disabled}
                    onClickRemove={onClickRemove}
                />
            ) : (
                <div className={classNames(['row', 'align-items-center'])}>
                    <div className="col-auto flex-grow-1">
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
                            multiple={multiple}
                        />
                    </div>

                    {canCreate ? (
                        <div className="col-auto">
                            <Button
                                theme="primary"
                                icon="plus-lg"
                                onClick={createOpen ? onCloseCreate : onOpenCreate}
                                outline
                            />
                        </div>
                    ) : null}

                    {createOpen ? (
                        createInPlace ? (
                            <ResourceForm
                                resource={resource}
                                type={resourceType}
                                onSuccess={onCreateSuccess}
                            />
                        ) : (
                            <Dialog
                                title={
                                    <FormattedMessage
                                        values={resourceValues}
                                        defaultMessage="Create {a_singular}"
                                        description="Page title"
                                    />
                                }
                                size="lg"
                                onClickClose={onCloseCreate}
                            >
                                <ResourceForm
                                    resource={resource}
                                    type={resourceType}
                                    onSuccess={onCreateSuccess}
                                />
                            </Dialog>
                        )
                    ) : null}
                </div>
            )}
        </div>
    );
};

ResourceItemField.propTypes = propTypes;
ResourceItemField.defaultProps = defaultProps;

export default ResourceItemField;
