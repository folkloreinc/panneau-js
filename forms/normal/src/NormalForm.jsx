/* eslint-disable react/button-has-type */
import React, { useCallback, useMemo } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import isObject from 'lodash/isObject';
import isFunction from 'lodash/isFunction';
import { PropTypes as PanneauPropTypes, ErrorsComponent as Errors } from '@panneau/core';
import { FieldsGroup } from '@panneau/field';
import { PropTypes as FormPropTypes, FormActions, messages, withFormContainer } from '@panneau/form';

import styles from './styles.scss';

const propTypes = {
    action: PropTypes.string,
    method: PropTypes.string,
    fields: PropTypes.arrayOf(PropTypes.object),
    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    errors: FormPropTypes.errors,
    notice: FormPropTypes.notice,
    buttons: PanneauPropTypes.buttons,
    submitForm: PropTypes.func,
    readOnly: PropTypes.bool,
    withoutActions: PropTypes.bool,
    forwardRef: PanneauPropTypes.ref,
    onChange: PropTypes.func,
    onSubmit: PropTypes.func,
    onErrors: PropTypes.func,
    onComplete: PropTypes.func,
};

const defaultProps = {
    action: '',
    method: 'POST',
    buttons: [
        {
            id: 'submit',
            type: 'submit',
            label: messages.save,
            className: 'btn-primary',
        },
    ],
    fields: [],
    value: null,
    errors: null,
    notice: null,
    submitForm: null,
    readOnly: false,
    withoutActions: false,
    forwardRef: null,
    onChange: null,
    onSubmit: null,
    onErrors: null,
    onComplete: null,
};

const NormalForm = ({
    value,
    errors,
    submitForm,
    action,
    method,
    fields,
    buttons,
    notice,
    readOnly,
    withoutActions,
    forwardRef,
    onChange,
    onErrors,
    onSubmit,
    onComplete,
}) => {
    const errorsIsGeneral = errors !== null && !isObject(errors);
    const refForm = React.createRef();

    const submit = useCallback(() => {
        if (submitForm !== null) {
            submitForm(value)
                .then(onComplete)
                .catch(onErrors);
        } else {
            refForm.current.submit();
        }
    }, [submitForm, value, refForm.current]);

    const onFormSubmit = useCallback(
        e => {
            if (onSubmit !== null) {
                onSubmit(e, value);
            } else {
                e.preventDefault();
                submit();
            }
        },
        [onSubmit, value],
    );

    const refApi = useMemo(
        () => ({
            submit,
        }),
        [],
    );

    if (isFunction(forwardRef)) {
        forwardRef(refApi);
    } else if (forwardRef !== null) {
        // eslint-disable-next-line no-param-reassign
        forwardRef.current = refApi;
    }

    return (
        <div className={styles.container}>
            <form
                action={action}
                method={method}
                onSubmit={onFormSubmit}
                className={styles.form}
                ref={refForm}
            >
                {errorsIsGeneral ? <Errors className={styles.errors} errors={errors} /> : null}

                <div className={styles.fields}>
                    <FieldsGroup
                        readOnly={readOnly}
                        fields={fields}
                        value={value}
                        errors={!errorsIsGeneral ? errors : null}
                        onChange={onChange}
                    />
                </div>
                {!withoutActions ? (
                    <FormActions
                        notice={notice}
                        buttons={buttons}
                        className={classNames(['mt-4', 'border-top', 'pt-2', styles.actions])}
                    />
                ) : null}
            </form>
        </div>
    );
};

NormalForm.propTypes = propTypes;
NormalForm.defaultProps = defaultProps;

export default withFormContainer(
    React.forwardRef((props, ref) => <NormalForm {...props} forwardRef={ref} />),
);
