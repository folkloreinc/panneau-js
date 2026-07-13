import {
    ElementType,
    ForwardedRef,
    type ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';

import type { Item, Resource } from '@panneau/core';
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
    item?: Item | null;
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

    const finalFields = (
        formFields ||
        defaultFields ||
        resourceTypeFields ||
        resourceFields
    ).filter(({ settings: { hiddenInForm = false } = {} }) => !hiddenInForm);

    // Form routes
    const resourceRoute = useResourceUrlGenerator(resource);
    const { storeAsync, loading: storing } = useResourceStore(resource);
    const { updateAsync, loading: updating } = useResourceUpdate(resource, itemId);
    const { destroyAsync, loading: destroying } = useResourceDestroy(resource, itemId);
    const { cloneAsync, loading: cloning } = useResourceClone(resource, itemId);
    const loading = storing || updating || destroying || cloning;

    // Post actions
    const postForm = (action: string, data: unknown) => {
        if (isDelete) {
            return destroyAsync();
        }
        if (isDuplicate) {
            return cloneAsync();
        }
        if (isCreate) {
            return storeAsync(data);
        }
        return updateAsync(data);
    };

    // Form state
    function getInitialValue() {
        return item !== null
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
              );
    }
    const [currentItem, setCurrentItem] = useState(item);
    const [value, setValue] = useState(() => getInitialValue());
    if (item !== currentItem) {
        setCurrentItem(item);
        setValue(getInitialValue());
    }

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

    let finalComponent: string | ElementType = component;

    if (isDelete) {
        finalComponent = DeleteForm;
    }

    if (isDuplicate) {
        finalComponent = DuplicateForm;
    }

    // Form component
    const FormComponent = getComponentFromName(defaultFormName, FormComponents, finalComponent);

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
