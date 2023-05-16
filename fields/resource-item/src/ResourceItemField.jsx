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
import Select from '@panneau/element-select';
import Dialog from '@panneau/modal-dialog';

const propTypes = {
    name: PropTypes.string,
    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    errors: PanneauPropTypes.formErrors,

    resource: PropTypes.string,
    query: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    page: PropTypes.oneOfType([PropTypes.number, PropTypes.string]), // eslint-disable-line react/forbid-prop-types
    count: PropTypes.oneOfType([PropTypes.number, PropTypes.string]), // eslint-disable-line react/forbid-prop-types
    options: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    searchParamName: PropTypes.string,

    getItemLabel: PropTypes.func,
    getItemDescription: PropTypes.func,
    // getItemImage: PropTypes.func,
    itemLabelPath: PropTypes.string,
    itemDescriptionPath: PropTypes.string,
    // itemImagePath: PropTypes.string,
    itemLabelWithId: PropTypes.bool,

    placeholder: PropTypes.string,
    canCreate: PropTypes.bool,
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
    query: null,
    page: null,
    count: null,
    options: null,
    searchParamName: 'search',

    getItemLabel: getPathValue,
    getItemDescription: getPathValue,
    // getItemImage: getPathValue,
    itemLabelPath: 'label',
    itemDescriptionPath: null,
    // itemImagePath: 'image',
    itemLabelWithId: false,

    placeholder: null,
    canCreate: false,
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
    query: initialQuery,
    page: initialPage,
    count: initialCount,
    options: initialOptions,
    searchParamName,

    getItemLabel: initialGetItemLabel,
    getItemDescription,
    // getItemImage,
    itemLabelPath,
    itemDescriptionPath,
    // itemImagePath,
    itemLabelWithId,

    placeholder,
    canCreate,
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

    const completeResource = usePanneauResource(resourceId);

    console.log(resourceId, completeResource);

    const resource = useMemo(() => ({ id: resourceId }), [resourceId]);
    const finalQuery = useMemo(
        () => ({
            ...query,
            ...(!isEmpty(inputTextValue) ? { [searchParamName]: inputTextValue } : null),
        }),
        [inputTextValue],
    );

    const resourceItems = useResourceItems(resource, finalQuery, page, count, resourceOptions);
    const { items = null } = resourceItems || {};

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

    const options = (items || []).map((it) => parseItem(it));
    const finalValue = multiple && isArray(value) ? value.map((it) => parseItem(it)) : value;

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

    return (
        <div className={classNames(['position-relative', { [className]: className != null }])}>
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
                        />
                    </div>
                ) : null}
                {createOpen ? (
                    <Dialog onClickClose={onCloseCreate}>
                        <div className="card p-2">
                            <div>My create Modale</div>
                        </div>
                    </Dialog>
                ) : null}
            </div>
        </div>
    );
};

ResourceItemField.propTypes = propTypes;
ResourceItemField.defaultProps = defaultProps;

export default ResourceItemField;
