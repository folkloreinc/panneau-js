import classNames from 'classnames';
import type { FormEvent, ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';

import type { Button as ButtonType, FormStatus as FormStatusType, Label } from '@panneau/core';
import Button from '@panneau/element-button';
import Buttons from '@panneau/element-buttons';
import FormStatus from '@panneau/element-form-status';

interface FormProps {
    action?: string | null;
    method?: string;
    status?: FormStatusType;
    children?: ReactNode | null;
    actions?: ReactNode | null;
    buttons?: ButtonType[] | null;
    generalError?: string | null;
    buttonSize?: string;
    submitButtonLabel?: Label | null;
    onSubmit?: ((e: FormEvent) => void) | null;
    onCancel?: (() => void) | null;
    onCancelHref?: string | null;
    withoutActions?: boolean;
    withoutStatus?: boolean;
    withoutErrors?: boolean;
    withoutButtonGroup?: boolean;
    canSave?: boolean;
    disabled?: boolean;
    className?: string | null;
    buttonsClassName?: string | null;
    cancelClassName?: string | null;
}

function Form({
    action = null,
    method = 'POST',
    status = null,
    children = null,
    actions = null,
    buttons = null,
    generalError = null,
    buttonSize = 'lg',
    withoutButtonGroup = false,
    submitButtonLabel = null,
    onSubmit = null,
    onCancel = null,
    onCancelHref = null,
    withoutActions = false,
    withoutStatus = false,
    withoutErrors = false,
    canSave = true,
    disabled = false,
    className = null,
    buttonsClassName = null,
    cancelClassName = null,
}: FormProps) {
    return (
        <form
            action={action || undefined}
            method={method}
            onSubmit={onSubmit || undefined}
            disabled={disabled}
            className={className || undefined}
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
                        <div
                            className={classNames([
                                'ms-auto d-flex align-items-center',
                                {
                                    'btn-group': !withoutButtonGroup,
                                },
                            ])}
                        >
                            {actions}
                            {onCancel !== null || onCancelHref !== null ? (
                                <Button
                                    type="button"
                                    onClick={onCancel}
                                    href={onCancelHref}
                                    theme="secondary"
                                    size={buttonSize as any}
                                    disabled={status === 'loading'}
                                    className={classNames([
                                        {
                                            'me-2': withoutButtonGroup,
                                            [cancelClassName!]: cancelClassName !== null,
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
                                    items={buttons}
                                    className={classNames({
                                        // 'me-auto': actions === null,
                                        [buttonsClassName!]: buttonsClassName !== null,
                                    })}
                                />
                            ) : (
                                <Button
                                    type="submit"
                                    theme="primary"
                                    size={buttonSize as any}
                                    label={
                                        submitButtonLabel || (
                                            <FormattedMessage
                                                defaultMessage="Save"
                                                description="Button label"
                                            />
                                        )
                                    }
                                    // icon={status === 'loading' ? 'loading' : 'check'}
                                    // iconPosition="right"
                                    disabled={
                                        !canSave || (status === 'loading' && generalError === null)
                                    }
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
}

export default Form;
