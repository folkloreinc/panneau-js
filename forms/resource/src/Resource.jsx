/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { FormProvider, useFormsComponents, useLocales } from '@panneau/core/contexts';
import { useForm, useResourceUrlGenerator } from '@panneau/core/hooks';
import { getComponentFromName } from '@panneau/core/utils';
import { useResourceDestroy, useResourceStore, useResourceUpdate } from '@panneau/data';

import DeleteForm from './Delete';
import DuplicateForm from './Duplicate';

const propTypes = {
    resource: PanneauPropTypes.resource.isRequired,
    item: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    type: PropTypes.string,
    component: PropTypes.string,
    onSuccess: PropTypes.func,
    isDelete: PropTypes.bool,
    isDuplicate: PropTypes.bool,
};

const defaultProps = {
    item: null,
    type: null,
    component: null,
    onSuccess: null,
    isDelete: false,
    isDuplicate: false,
};

const ResourceForm = ({
    component,
    resource,
    onSuccess,
    item,
    type,
    isDelete,
    isDuplicate,
    ...props
}) => {
    const locales = useLocales();

    const FormComponents = useFormsComponents();
    const { fields: resourceFields = [], types: resourceTypes = [], forms } = resource;
    const resourceType = type !== null ? resourceTypes.find((it) => it.id === type) || null : null;
    const { fields: resourceTypeFields = null } = resourceType || {};
    const isCreate = item === null || !item.id;

    // Pick fields from resource root or form
    const {
        default: defaultForm = null,
        create: createForm = null,
        edit: editForm = null,
        delete: deleteForm = null,
    } = forms || {};
    const { fields: defaultFields = null, component: defaultComponent } = defaultForm || {};
    const createOrEditSource = isCreate ? createForm || {} : editForm || {};
    const { fields: formFields = null, component: formComponent = null } = isDelete
        ? deleteForm || {}
        : createOrEditSource || {};
    const finalFields = useMemo(
        () =>
            (formFields || defaultFields || resourceTypeFields || resourceFields).filter(
                ({ settings: { hiddenInForm = false } = {} }) => !hiddenInForm,
            ),
        [formFields, defaultFields, resourceTypeFields, resourceFields],
    );

    // Form routes
    const resourceRoute = useResourceUrlGenerator(resource);
    const { store } = useResourceStore(resource);
    const { update } = useResourceUpdate(resource, item != null ? item.id : null);
    const { destroy } = useResourceDestroy(resource, item != null ? item.id : null);

    // Post actions
    const postAction = isCreate ? store : update;
    const postForm = useCallback(
        (action, data) => (isDelete ? destroy() : postAction(data)),
        [postAction, isDelete, destroy, store, update],
    );

    // Form state
    const getInitialValue = useCallback(
        () =>
            item !== null
                ? item
                : finalFields.reduce(
                      (defaultValues, { name, defaultValue = null }) =>
                          defaultValue !== null
                              ? {
                                    ...defaultValues,
                                    [name]: defaultValue,
                                }
                              : defaultValues,
                      type !== null ? { type } : null,
                  ),
        [item, type, finalFields],
    );

    const [value, setValueState] = useState(getInitialValue());
    const setValue = useCallback(
        (newValue) => {
            setValueState(newValue);
        },
        [setValueState],
    );

    // Form action
    let action = isCreate
        ? resourceRoute('store')
        : resourceRoute('update', {
              id: item.id,
          });

    action = isDelete
        ? resourceRoute('destroy', {
              id: item.id,
          })
        : action;

    action = isDuplicate
        ? resourceRoute('clone', {
              id: item.id,
          })
        : action;

    const { fields, onSubmit, status, generalError, errors } = useForm({
        action,
        fields: finalFields,
        value,
        postForm,
        setValue,
        onComplete: onSuccess,
        locales,
    });

    const defaultFormName =
        isDelete || isDuplicate
            ? component || formComponent || null
            : component || formComponent || defaultComponent || 'normal';

    let finalComponent = component;

    if (isDelete) {
        finalComponent = DeleteForm;
    }

    if (isDuplicate) {
        finalComponent = DuplicateForm;
    }

    // Form component
    const FormComponent = getComponentFromName(defaultFormName, FormComponents, finalComponent);

    // Listen to item value change - this is important
    useEffect(() => {
        setValue(getInitialValue());
    }, [getInitialValue, setValue]);

    return (
        <FormProvider value={value} setValue={setValue}>
            <FormComponent
                {...props}
                status={status}
                resource={resource}
                item={item}
                fields={fields}
                generalError={generalError}
                errors={errors}
                action={action}
                onSubmit={onSubmit}
                isCreate={isCreate}
                value={value}
                onChange={setValue}
            />
        </FormProvider>
    );
};

ResourceForm.propTypes = propTypes;
ResourceForm.defaultProps = defaultProps;

export default ResourceForm;
