/* eslint-disable react/jsx-indent */
/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import FormStatus from '@panneau/element-form-status';
import Buttons from '@panneau/element-buttons';
import Button from '@panneau/element-button';

const propTypes = {
    action: PropTypes.string,
    method: PropTypes.string,
    status: PanneauPropTypes.formStatus,
    children: PropTypes.node,
    actions: PropTypes.node,
    buttons: PanneauPropTypes.buttons,
    submitButtonLabel: PanneauPropTypes.label,
    onSubmit: PropTypes.func,
    onCancel: PropTypes.func,
    onCancelHref: PropTypes.string,
    withoutActions: PropTypes.bool,
    withoutStatus: PropTypes.bool,
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
    submitButtonLabel: null,
    onSubmit: null,
    onCancel: null,
    onCancelHref: null,
    withoutActions: false,
    withoutStatus: false,
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
    submitButtonLabel,
    onSubmit,
    onCancel,
    onCancelHref,
    withoutActions,
    withoutStatus,
    className,
    buttonsClassName,
    cancelClassName,
}) => (
    <form action={action} method={method} onSubmit={onSubmit} className={className}>
        {children}
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
                            <FormattedMessage defaultMessage="Cancel" description="Button label" />
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
                                        defaultMessage="Submit"
                                        description="Button label"
                                    />
                                )
                            }
                            className={classNames({
                                'ms-auto': actions === null,
                            })}
                        />
                    )}
                </div>
            ) : null}
        </div>
    </form>
);

Form.propTypes = propTypes;
Form.defaultProps = defaultProps;

export default Form;
