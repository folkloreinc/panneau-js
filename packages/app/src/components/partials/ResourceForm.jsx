/* eslint-disable react/jsx-props-no-spreading */
import React, { useCallback, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { getComponentFromName } from '@panneau/core/utils';

import { FormProvider, useFormsComponents } from '@panneau/core/contexts';
import { useResourceUpdate, useResourceStore } from '@panneau/data';
import { useForm } from '@panneau/core/hooks';

import useResourceUrlGenerator from '../../hooks/useResourceUrlGenerator';

// import * as FormComponents from './resources';

const propTypes = {
    component: PropTypes.string,
    resource: PanneauPropTypes.resource.isRequired,
    messages: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    item: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    onSuccess: PropTypes.func,
    isDelete: PropTypes.bool,
};

const defaultProps = {
    component: null,
    item: null,
    messages: null,
    onSuccess: null,
    isDelete: false,
};

const ResourceForm = ({ component, resource, messages, onSuccess, item, isDelete, ...props }) => {
    const FormComponents = useFormsComponents();
    const { fields: baseFields, forms = {} } = resource || {};
    const isCreate = item === null || !item.id;

    // Pick fields from resource root or form
    const { default: defaultForm = null, create: createForm = null, edit: editForm = null } =
        forms || {};
    const { fields: defaultFields, component: defaultComponent } = defaultForm || {};
    const { fields: formFields = null, component: formComponent = null } = isCreate
        ? createForm || {}
        : editForm || {};
    const resourceFields = formFields || defaultFields || baseFields;

    // Form routes
    const resourceRoute = useResourceUrlGenerator(resource);
    const { store } = useResourceStore(resource);
    const { update } = useResourceUpdate(resource, item != null ? item.id : null);
    const postForm = useCallback((action, data) => (isCreate ? store(data) : update(data)), [
        isCreate,
        store,
        update,
    ]);

    // Form state
    const getInitialValue = useCallback(() => {
        return item !== null
            ? item
            : resourceFields.reduce(
                  (defaultValues, { name, default_value: defaultValue = null }) =>
                      defaultValue !== null
                          ? {
                                ...defaultValues,
                                [name]: defaultValue,
                            }
                          : defaultValues,
                  null,
              );
    }, [item, resourceFields]);
    const [value, setValue] = useState(getInitialValue());
    const { fields, onSubmit, status, generalError, errors } = useForm({
        fields: resourceFields,
        value,
        postForm,
        setValue,
        onComplete: onSuccess,
    });

    // Form action
    const modifyAction = isCreate
        ? resourceRoute('store')
        : resourceRoute('update', {
              id: item.id,
          });

    const action = isDelete
        ? resourceRoute('destroy', {
              id: item.id,
          })
        : modifyAction;

    // Form component
    const FormComponent = getComponentFromName(
        component || formComponent || defaultComponent || 'normal',
        FormComponents,
        component,
    );

    // Lisen to item value change
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
                messages={messages}
                onChange={setValue}
            />
        </FormProvider>
    );
};

ResourceForm.propTypes = propTypes;
ResourceForm.defaultProps = defaultProps;

export default ResourceForm;
