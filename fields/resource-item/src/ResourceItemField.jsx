/* eslint-disable no-nested-ternary */

/* eslint-disable no-shadow, react/jsx-props-no-spreading */
import classNames from 'classnames';
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
// import ResourceFormModal from '@panneau/modal-resource-form';
import ResourceItemsModal from '@panneau/modal-resource-items';

const propTypes = {
    name: PropTypes.string,
    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    errors: PanneauPropTypes.formErrors,

    resource: PropTypes.string,
    resourceType: PropTypes.string,
    paginated: PropTypes.bool,

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
    canEdit: PropTypes.bool,
    canFind: PropTypes.bool,
    withoutModal: PropTypes.bool,
    createButtonLabel: PanneauPropTypes.message,
    editButtonLabel: PanneauPropTypes.message,
    findButtonLabel: PanneauPropTypes.message,
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
    paginated: true,

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
    itemImagePath: 'image.thumbnail_url',
    itemLabelWithId: false,

    placeholder: null,
    canCreate: false,
    canEdit: false,
    canFind: false,
    withoutModal: false,
    createButtonLabel: null,
    editButtonLabel: null,
    findButtonLabel: null,
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
    paginated,

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
    canEdit,
    canFind,
    withoutModal,
    createButtonLabel,
    editButtonLabel,
    findButtonLabel,
    multiple,
    disabled,
    className,
    inputClassName,
    onChange,
}) => {
    const intl = useIntl();
    const resource = usePanneauResource(resourceId);
    const resourceValues = useResourceValues(resource);
    const defaultPage = initialPage || (paginated ? 1 : null);
    const defaultCount = initialCount || (paginated ? 10 : null);
    const hasValue = value !== null && !isEmpty(value);

    // const [initialValue] = useState(value);

    const [formOpen, setFormOpen] = useState(false);
    const [listOpen, setListOpen] = useState(false);

    // The text input search query
    const [inputTextValue, setInputTextValue] = useState('');
    const onInputChange = useCallback((textValue) => {
        setInputTextValue(textValue);
    }, []);

    // TODO: list state controls?
    const [query, setQuery] = useState(initialQuery);
    const [page, setPage] = useState(defaultPage);
    const [count, setCount] = useState(defaultCount);
    const [resourceOptions, setOptions] = useState(initialOptions);

    const queryResource = useMemo(() => ({ id: resourceId }), [resourceId]);
    const finalQuery = useMemo(
        () => ({
            ...query,
            ...(!isEmpty(inputTextValue) ? { [searchParamName]: inputTextValue } : null),
            paginated,
        }),
        [inputTextValue, paginated],
    );

    const resourceItems = useResourceItems(
        queryResource,
        finalQuery,
        paginated ? page : null,
        paginated ? count : null,
        resourceOptions,
    );

    const {
        allItems: partialItems = null,
        reload = null,
        reloadPage = null,
        reset = null,
        lastPage = null,
    } = resourceItems || {};

    const items = (partialItems || [])
        .concat(multiple && isArray(value) ? value : [value])
        .filter((it) => it !== null)
        .filter((v, i, a) => a.findIndex((v2) => v2.id === v.id) === i);

    const onScrollEnd = useCallback(() => {
        if (page !== null && page >= lastPage) {
            return;
        }
        if (paginated) {
            setPage(page + 1);
        }
    }, [paginated, page, setPage, lastPage]);

    const getItemLabel = useCallback(
        (it, path) => {
            const { id = null } = it || {};
            if (itemLabelWithId) {
                const label = initialGetItemLabel(it, path);
                return label ? `${label} (#${id})` : `#${id}`;
            }
            return path !== null ? initialGetItemLabel(it, path) : `#${id}`;
        },
        [initialGetItemLabel, itemLabelWithId],
    );

    // const getItemLabel = getItemLabelFunction(initialGetItemLabel, itemLabelWithId);

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

    const finalValue =
        multiple && isArray(value) ? value.map(({ id = null }) => id) : value?.id || null;
    const { type: finalType = null } = !multiple && hasValue ? value : { type: resourceType };
    const options = (items || []).map((it) => parseItem(it));

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

    const onOpenForm = useCallback(() => {
        setFormOpen(true);
    }, [setFormOpen]);

    const onCloseForm = useCallback(() => {
        setFormOpen(false);
    }, [setFormOpen]);

    const onFormSuccess = useCallback(
        (newValue) => {
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
        [onChange, multiple, value, setFormOpen, resourceType, paginated, initialPage],
    );

    const onOpenList = useCallback(() => {
        setListOpen(false); // TODO: fix this
    }, [setListOpen]);

    const onCloseList = useCallback(() => {
        setListOpen(false);
    }, [setListOpen]);

    const onSelectListItem = useCallback(
        (newValue) => {
            if (onChange !== null) {
                onChange(newValue);
                setListOpen(false);
            }
        },
        [onChange, setListOpen],
    );

    // If empty try to fetch
    const onFocus = useCallback(() => {
        if ((partialItems || []).length === 0) {
            if (paginated) {
                reloadPage();
            } else {
                reload();
            }
        }
    }, [paginated, partialItems]);

    const onClickRemove = useCallback(() => {
        if (onChange !== null) {
            onChange(null);
        }
        // Clear the page and be good
        if (paginated) {
            setPage(defaultPage);
            reset();
        } else {
            reset();
        }
    }, [onChange, paginated, defaultPage, reload, reloadPage, reset]);

    const form = formOpen ? (
        <ResourceForm
            resource={resource}
            type={finalType}
            item={!multiple ? value : null}
            onSuccess={onFormSuccess}
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
                            onFocus={onFocus}
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
            {listOpen ? (
                <ResourceItemsModal
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
};

ResourceItemField.propTypes = propTypes;
ResourceItemField.defaultProps = defaultProps;

export default ResourceItemField;
