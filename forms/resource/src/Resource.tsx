import { ForwardedRef, type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import type { Resource } from '@panneau/core';
import {
    FormProvider,
    useFormsComponents,
    useLocales,
    usePanneauResource,
} from '@panneau/core/contexts';
import { useForm, useResourceUrlGenerator } from '@panneau/core/hooks';
import { getComponentFromName } from '@panneau/core/utils';
import {
    useResourceClone,
    useResourceDestroy,
    useResourceStore,
    useResourceUpdate,
} from '@panneau/data';

import DeleteForm from './Delete';
import DuplicateForm from './Duplicate';

interface ResourceFormProps {
    resource: Resource | string;
    item?: Record<string, unknown> | null;
    type?: string | null;
    component?: string | null;
    header?: ReactNode | null;
    onComplete?: ((result: unknown) => void) | null;
    isDelete?: boolean;
    isDuplicate?: boolean;
    isModal?: boolean;
    withContainer?: boolean;
    ref?: ForwardedRef<HTMLFormElement> | null;
}

function ResourceForm({
    resource: providedResource,
    component = null,
    header = null,
    onComplete = null,
    item = null,
    type = null,
    isDelete = false,
    isDuplicate = false,
    isModal = false,
    withContainer = false,
    ref,
    ...props
}: ResourceFormProps) {
    const locales = useLocales();
    const FormComponents = useFormsComponents();
    const { id: itemId = null } = item || {};

    const resource = usePanneauResource(providedResource);
    const { fields: resourceFields = [], types: resourceTypes = [], forms } = resource;
    const resourceType = type !== null ? resourceTypes.find((it) => it.id === type) || null : null;
    const { fields: resourceTypeFields = null } = resourceType || {};
    const isCreate = item === null || !itemId;

    // Pick fields from resource root or form
    const {
        default: defaultForm = null,
        create: createForm = null,
        edit: editForm = null,
        delete: deleteForm = null,
        modal: modalForm = null,
    } = forms || {};

    const {
        fields: defaultFields = null,
        component: defaultComponent,
        withoutHeader: defaultFormWithoutHeader = false,
        withoutContainer: defaultFormWithoutContainer = false,
    } = defaultForm || {};

    let currentForm = editForm || null;
    if (isModal) {
        currentForm = modalForm || null;
    } else if (isDelete) {
        currentForm = deleteForm || null;
    } else if (isCreate) {
        currentForm = createForm || null;
    }

    const {
        fields: formFields = null,
        component: formComponent = null,
        withoutHeader: formWithoutHeader = false,
        withoutContainer: formWithoutContainer = false,
    } = currentForm || {};

    const finalFields = useMemo(
        () =>
            (formFields || defaultFields || resourceTypeFields || resourceFields).filter(
                ({ settings: { hiddenInForm = false } = {} }) => !hiddenInForm,
            ),
        [formFields, defaultFields, resourceTypeFields, resourceFields],
    );

    // Form routes
    const resourceRoute = useResourceUrlGenerator(resource);
    const { store, loading: storing } = useResourceStore(resource);
    const { update, loading: updating } = useResourceUpdate(
        resource,
        item !== null ? itemId : null,
    );
    const { destroyAsync, loading: destroying } = useResourceDestroy(
        resource,
        item !== null ? itemId : null,
    );
    const { clone, loading: cloning } = useResourceClone(resource, item !== null ? itemId : null);
    const loading = storing || updating || destroying || cloning;

    // Post actions
    const postForm = useCallback(
        (action: string, data: unknown) => {
            if (isDelete) {
                return destroyAsync();
            }
            if (isDuplicate) {
                return clone();
            }
            if (isCreate) {
                return store(data);
            }
            return update(data);
        },
        [itemId, isCreate, isDelete, isDuplicate, destroyAsync, clone, store, update],
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
                                    [name!]: defaultValue,
                                }
                              : defaultValues,
                      type !== null ? { type } : {},
                  ),
        [item, type, finalFields],
    );

    const [value, setValueState] = useState(getInitialValue());
    const setValue = useCallback(
        (newValue: Record<string, unknown>) => {
            setValueState(newValue);
        },
        [setValueState],
    );

    // Form action
    let action = isCreate
        ? resourceRoute('store')
        : resourceRoute('update', {
              id: itemId,
          });

    action = isDelete
        ? resourceRoute('destroy', {
              id: itemId,
          })
        : action;

    action = isDuplicate
        ? resourceRoute('clone', {
              id: itemId,
          })
        : action;

    const { fields, onSubmit, status, generalError, errors } = useForm({
        action,
        fields: finalFields,
        value,
        postForm,
        setValue,
        onComplete: onComplete,
        locales,
    });

    const defaultFormName =
        isDelete || isDuplicate
            ? component || formComponent || null
            : component || formComponent || defaultComponent || 'normal';

    const finalWithContainer =
        withContainer &&
        defaultFormName !== 'two-pane' &&
        !defaultFormWithoutContainer &&
        !formWithoutContainer;

    const finalWithHeader =
        header !== null &&
        defaultFormName !== 'two-pane' &&
        !defaultFormWithoutHeader &&
        !formWithoutHeader;

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

    const element = (
        <FormComponent
            {...props}
            ref={ref}
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
            loading={loading}
        />
    );

    return (
        <FormProvider value={value} setValue={setValue}>
            {finalWithHeader ? header : <div className="w-100 mb-3" />}
            {finalWithContainer ? (
                <div className="container-sm py-4">
                    <div className="row justify-content-center">
                        <div className="col-12 col-md-8 col-lg-7">{element}</div>
                    </div>
                </div>
            ) : (
                element
            )}
        </FormProvider>
    );
}

export default ResourceForm;
