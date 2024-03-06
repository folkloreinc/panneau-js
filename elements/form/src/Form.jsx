/* eslint-disable react/jsx-indent */

/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import Button from '@panneau/element-button';
import Buttons from '@panneau/element-buttons';
import FormStatus from '@panneau/element-form-status';

const propTypes = {
    action: PropTypes.string,
    method: PropTypes.string,
    status: PanneauPropTypes.formStatus,
    children: PropTypes.node,
    actions: PropTypes.node,
    buttons: PanneauPropTypes.buttons,
    generalError: PropTypes.string,
    submitButtonLabel: PanneauPropTypes.label,
    onSubmit: PropTypes.func,
    onCancel: PropTypes.func,
    onCancelHref: PropTypes.string,
    withoutActions: PropTypes.bool,
    withoutStatus: PropTypes.bool,
    withoutErrors: PropTypes.bool,
    canSave: PropTypes.bool,
    disabled: PropTypes.bool,
    className: PropTypes.string,
    buttonsClassName: PropTypes.string,
    cancelClassName: PropTypes.string,
};

const defaultProps = {
    action: null,
    method: 'POST',
    status: null,
    children: null,
    actions: null,
    buttons: null,
    generalError: null,
    submitButtonLabel: null,
    onSubmit: null,
    onCancel: null,
    onCancelHref: null,
    withoutActions: false,
    withoutStatus: false,
    withoutErrors: false,
    canSave: true,
    disabled: false,
    className: null,
    buttonsClassName: null,
    cancelClassName: null,
};

const Form = ({
    action,
    method,
    status,
    children,
    actions,
    buttons,
    generalError,
    submitButtonLabel,
    onSubmit,
    onCancel,
    onCancelHref,
    withoutActions,
    withoutStatus,
    withoutErrors,
    canSave,
    disabled,
    className,
    buttonsClassName,
    cancelClassName,
}) => (
    <form
        action={action}
        method={method}
        onSubmit={onSubmit}
        disabled={disabled}
        className={className}
    >
        {children}
        {!withoutErrors && generalError !== null && !disabled ? (
            <p className="text-danger mt-4">
                <FormattedMessage
                    defaultMessage="An error occured and we could not save this item successfully."
                    description="Error message"
                />
            </p>
        ) : null}
        {((!withoutStatus && status !== null) || !withoutActions) && !disabled ? (
            <div className="mt-4 d-flex align-items-center">
                {!withoutStatus && status !== null ? <FormStatus status={status} /> : null}
                {!withoutActions ? (
                    <div className="ms-auto d-flex align-items-center">
                        {actions}
                        {onCancel !== null || onCancelHref !== null ? (
                            <Button
                                type="button"
                                onClick={onCancel}
                                href={onCancelHref}
                                theme="secondary"
                                outline
                                disabled={status === 'loading'}
                                className={classNames([
                                    'mr-2',
                                    {
                                        [cancelClassName]: cancelClassName !== null,
                                    },
                                ])}
                            >
                                <FormattedMessage
                                    defaultMessage="Cancel"
                                    description="Button label"
                                />
                            </Button>
                        ) : null}
                        {buttons !== null ? (
                            <Buttons
                                buttons={buttons}
                                className={classNames({
                                    // 'ml-auto': actions === null,
                                    [buttonsClassName]: buttonsClassName !== null,
                                })}
                            />
                        ) : (
                            <Button
                                type="submit"
                                theme="primary"
                                size="lg"
                                label={
                                    submitButtonLabel || (
                                        <FormattedMessage
                                            defaultMessage="Save"
                                            description="Button label"
                                        />
                                    )
                                }
                                disabled={!canSave || (status === 'loading' && generalError === null)}
                                outline={!canSave}
                                className={classNames({
                                    'ms-auto': actions === null,
                                })}
                            />
                        )}
                    </div>
                ) : null}
            </div>
        ) : null}
    </form>
);

Form.propTypes = propTypes;
Form.defaultProps = defaultProps;

export default Form;
