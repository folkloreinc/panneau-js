import React, { useCallback, useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import isObject from 'lodash/isObject';
import classNames from 'classnames';
import { defineMessages } from 'react-intl';
import { PropTypes as PanneauPropTypes, useResourceApi, getErrorsFromResponseError } from '@panneau/core';
import { Loading, Errors } from '@panneau/core/components';
import { useComponent } from '@panneau/core/contexts';

import ResourceFormHeader from '../partials/ResourceFormHeader';

import styles from '../../styles/pages/resource-form.scss';

export const messages = defineMessages({
    cancel: {
        id: 'app.buttons.resources.cancel',
        description: 'The label of the "cancel" button',
        defaultMessage: 'Cancel',
    },
    save: {
        id: 'app.buttons.resources.save',
        description: 'The label of the "save" button',
        defaultMessage: 'Save',
    },
    title: {
        id: 'app.titles.resources.default',
        description: 'The title of the resource form',
        defaultMessage: '{name}',
    },
    titleTyped: {
        id: 'app.titles.resources.typed',
        description: 'The title of the typed resource form',
        defaultMessage: '{name} <small class="text-muted">({type})</small>',
    },
    successNotice: {
        id: 'app.notices.resources.success',
        description: 'The text of the "success" form notice',
        defaultMessage: 'Success!',
    },
    errorNotice: {
        id: 'app.notices.resources.error',
        description: 'The text of the "error" form notice',
        defaultMessage: 'Failed. The form contains errors.',
    },
});

const propTypes = {
    intl: PanneauPropTypes.intl.isRequired,
    urlGenerator: PanneauPropTypes.urlGenerator.isRequired,
    action: PropTypes.string,
    resource: PanneauPropTypes.definitions.resource.isRequired,
    resourceApi: PanneauPropTypes.resourceApi.isRequired,
    itemId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    item: PropTypes.shape({
        id: PropTypes.number,
        type: PropTypes.string,
    }),
    query: PropTypes.shape({
        type: PropTypes.string,
    }),
    successNoticeLabel: PanneauPropTypes.label,
    errorNoticeLabel: PanneauPropTypes.label,
    buttons: PanneauPropTypes.buttons,
    saveButtonLabel: PanneauPropTypes.message,
    confirmSwitchTypeMessage: PanneauPropTypes.message,
    errors: PropTypes.arrayOf(PropTypes.string),
    formValue: PropTypes.shape({}),
    formErrors: PropTypes.objectOf(PropTypes.array),
    readOnly: PropTypes.bool,
    title: PanneauPropTypes.label,
    titleTyped: PanneauPropTypes.label,
    gotoResourceAction: PropTypes.func.isRequired,
    onFormComplete: PropTypes.func,
};

const defaultProps = {
    action: 'create',
    title: messages.title,
    titleTyped: messages.titleTyped,
    query: null,
    itemId: null,
    item: null,
    errors: null,
    formValue: null,
    formErrors: null,
    readOnly: false,
    successNoticeLabel: messages.successNotice,
    errorNoticeLabel: messages.errorNotice,
    confirmSwitchTypeMessage: messages.confirmSwitchType,
    buttons: [
        {
            id: 'cancel',
            type: 'button',
            label: messages.cancel,
            className: 'btn-link btn-lg',
        },
        {
            id: 'submit',
            type: 'submit',
            label: messages.save,
            className: 'btn-primary btn-lg',
        },
    ],
    saveButtonLabel: null,
    onFormComplete: null,
};

const ResourceForm = ({
    resource,
    item: currentItem,
    itemId,
    query,
    action,
    readOnly,
    errors: currentErrors,
    formValue: initialFormValue,
    formErrors: initialFormErrors,
    title,
    titleTyped,
    buttons,
    saveButtonLabel,
    successNoticeLabel,
    errorNoticeLabel,
    onFormComplete: customOnFormComplete,
    gotoResourceAction,
}) => {
    const [item, setItem] = useState(currentItem);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState(currentErrors || item);
    const [formValue, setFormValue] = useState(initialFormValue || item);
    const [formErrors, setFormErrors] = useState(initialFormErrors || item);
    const [formSuccess, setFormSuccess] = useState(initialFormErrors !== null ? false : null);
    const resourceApi = useResourceApi(resource);
    const { type = null, types = [] } = resource;
    const isTyped = type === 'typed';
    const waitingItem = action === 'edit' && item === null;

    // Load item if needed
    useEffect(() => {
        if (isLoading) {
            return;
        }
        const onItemLoaded = (newItem) => {
            setItem(newItem);
        };
        const onItemLoadError = (newErrors) => {
            setErrors(newErrors);
        };
        const itemChanged = item !== null && `${item.id}` !== `${itemId}`;
        const itemShouldReload = item === null || itemChanged;
        if ((action === 'edit' || action === 'show') && itemShouldReload) {
            setIsLoading(true);
            resourceApi
                .show(itemId)
                .then(onItemLoaded)
                .catch(onItemLoadError)
                .then(() => {
                    setIsLoading(false);
                });
        }
    }, [action, item, itemId, isLoading]);

    // Get current type
    const currentType = useMemo(() => {
        if (!isTyped || waitingItem) {
            return null;
        }

        const itemTypeId = item !== null ? item.type || null : null;
        const { type: queryTypeId = null } = query || {};
        const typeId = itemTypeId || queryTypeId;
        const definedType = typeId !== null ? types.find(it => it.id === typeId) || null : null;
        if (definedType !== null) {
            return definedType;
        }

        return types.length > 0
            ? types.find(({ default: isDefault = false }) => isDefault) || types[0] || null
            : null;
    }, [item, query, types]);

    const onClickCancel = useCallback(
        e => {
            e.preventDefault();
            gotoResourceAction('index');
        },
        [gotoResourceAction],
    );

    const formButtons = useMemo(
        () =>
            readOnly
                ? []
                : buttons.map(button => {
                      if (button.id === 'save' && saveButtonLabel !== null) {
                          return {
                              ...button,
                              label: saveButtonLabel,
                          };
                      }
                      if (button.id === 'cancel' && typeof button.onClick === 'undefined') {
                          return {
                              ...button,
                              onClick: onClickCancel,
                          };
                      }
                      return button;
                  }),
        [buttons, readOnly],
    );

    const submitForm = useCallback(() => {
        const data = isTyped
            ? {
                  type: type !== null ? type.id : null,
                  ...(formValue || item),
              }
            : formValue;

        setFormSuccess(null);

        return action === 'create'
            ? resourceApi.store(data)
            : resourceApi.update(item.id, data || item);
    }, [resourceApi, action, isTyped, type]);

    const onFormChange = useCallback(value => {
        setFormValue(value);
        setFormSuccess(null);
    }, []);

    const onFormComplete = useCallback(
        newItem => {
            setItem(newItem);
            setFormValue(null);
            setFormErrors(null);
            setFormSuccess(true);
            if (customOnFormComplete !== null) {
                customOnFormComplete(item);
            }
        },
        [customOnFormComplete],
    );

    const onFormErrors = useCallback(error => {
        const newErrors = getErrorsFromResponseError(error);
        setFormErrors(newErrors);
        setFormSuccess(false);
    }, []);


    // Get form definition
    const { type: formType = null, fullscreen, className = null, ...formProps } = useMemo(() => {
        const { forms = {} } = resource;
        const { fields = [], ...form } = forms[action] || forms;
        let finalFields;
        if (waitingItem) {
            finalFields = null;
        } else if (currentType !== null && isObject(fields)) {
            finalFields = fields[currentType.id] || fields.default || fields;
        } else {
            finalFields = fields;
        }
        return {
            type: 'normal',
            fullscreen: false,
            fields: finalFields,
            ...form,
        };
    }, [waitingItem, resource, currentType]);

    const FormComponent = useComponent(formType, 'forms');
    const form =
        !waitingItem && FormComponent !== null ? (
            <FormComponent
                {...formProps}
                className={classNames([
                    styles.form,
                    {
                        [className]: className !== null,
                    },
                ])}
                readOnly={readOnly}
                buttons={formButtons}
                value={formValue || item}
                errors={formErrors}
                notice={formSuccess !== null
                    ? {
                          type: formSuccess ? 'success' : 'error',
                          label: formSuccess ? successNoticeLabel : errorNoticeLabel,
                      }
                    : null}
                submitForm={submitForm}
                onChange={onFormChange}
                onComplete={onFormComplete}
                onErrors={onFormErrors}
            />
        ) : null;

    const header = (
        <ResourceFormHeader
            resource={resource}
            type={currentType}
            action={action}
            fullscreen={fullscreen}
            valueHasChanged={formValue !== null}
            title={title}
            titleTyped={titleTyped}
        />
    );

    const errorsMessages =
        errors !== null && errors.length > 0 ? (
            <Errors errors={errors} className={styles.errors} />
        ) : null;

    const content =
        isLoading && item === null ? (
            <div className={classNames(['py-4', styles.loading])}>
                <Loading loading />
            </div>
        ) : (
            form
        );

    return (
        <div
            className={classNames([
                styles.container,
                {
                    [styles.isFullscreen]: fullscreen,
                },
            ])}
        >
            {fullscreen ? (
                <div className={classNames([styles.inner])}>
                    {header}
                    <div className={classNames([styles.content])}>
                        {errorsMessages}
                        {content}
                    </div>
                </div>
            ) : (
                <div className="container">
                    <div className="row justify-content-md-center">
                        <div className="col-lg-9">
                            {header}
                            {errorsMessages}
                            {content}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

ResourceForm.propTypes = propTypes;
ResourceForm.defaultProps = defaultProps;

export default ResourceForm;
