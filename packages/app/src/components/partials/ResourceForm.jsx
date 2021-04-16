/* eslint-disable react/jsx-props-no-spreading */
import React, { useCallback, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { getComponentFromName } from '@panneau/core/utils';

import { FormProvider, useFormsComponents } from '@panneau/core/contexts';
import { useResourceUpdate, useResourceStore } from '@panneau/data';
import { useForm, useResourceUrlGenerator } from '@panneau/core/hooks';

// import * as FormComponents from './resources';

const propTypes = {
    component: PropTypes.string,
    resource: PanneauPropTypes.resource.isRequired,
    item: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    onSuccess: PropTypes.func,
};

const defaultProps = {
    component: null,
    item: null,
    onSuccess: null,
};

const ResourceForm = ({ component, resource, onSuccess, item, ...props }) => {
    const FormComponents = useFormsComponents();
    const { forms = {} } = resource || {};
    const isCreate = item !== null;

    const { default: defaultForm = null, create = null, edit = null } = forms || {};
    const { fields: resourceFields = [] } = isCreate ? create || defaultForm : edit || defaultForm;

    console.log(defaultForm, resourceFields);

    const resourceRoute = useResourceUrlGenerator(resource);
    const { store } = useResourceStore(resource);
    const { update } = useResourceUpdate(resource, item != null ? item.id : null);
    const postForm = useCallback((action, data) => (isCreate ? store(data) : update(data)), [
        isCreate,
        store,
        update,
    ]);
    const initialValue =
        item !== null
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
    const [value, setValue] = useState(initialValue);
    const { fields, onSubmit, status, generalError, errors } = useForm({
        fields: resourceFields,
        value,
        postForm,
        setValue,
        onComplete: onSuccess,
    });

    const action = isCreate
        ? resourceRoute('store')
        : resourceRoute('update', {
              id: item.id,
          });

    useEffect(() => {
        if (item !== null) {
            setValue(item);
        }
    }, [item, setValue]);

    const FormComponent = getComponentFromName(component || 'normal', FormComponents, null);

    console.log('normie', fields);

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
                setValue={setValue}
            />
        </FormProvider>
    );
};

ResourceForm.propTypes = propTypes;
ResourceForm.defaultProps = defaultProps;

export default ResourceForm;
