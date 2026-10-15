import classNames from 'classnames';
import type { FormHTMLAttributes, ForwardedRef, ReactNode, SubmitEvent } from 'react';
import { FormattedMessage } from 'react-intl';

import type {
    ButtonSize,
    Button as ButtonType,
    FormStatus as FormStatusType,
    Label,
} from '@panneau/core';
import Button from '@panneau/element-button';
import Buttons from '@panneau/element-buttons';
import FormStatus from '@panneau/element-form-status';

export interface FormProps extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
    action?: string | null;
    method?: string;
    status?: FormStatusType;
    children?: ReactNode | null;
    actions?: ReactNode | null;
    buttons?: ButtonType[] | null;
    generalError?: string | null;
    buttonSize?: string;
    cancelButtonLabel?: Label | null;
    submitButtonLabel?: Label | null;
    onSubmit?: ((e: SubmitEvent) => void) | null;
    onCancel?: (() => void) | null;
    onCancelHref?: string | null;
    withoutActions?: boolean;
    withoutButtons?: boolean;
    withoutStatus?: boolean;
    withoutErrors?: boolean;
    withoutSubmitButton?: boolean;
    withCancelButton?: boolean;
    withoutButtonGroup?: boolean;
    canSave?: boolean;
    disabled?: boolean;
    className?: string | null;
    actionsClassName?: string | null;
    buttonGroupClassName?: string | null;
    cancelClassName?: string | null;
    ref?: ForwardedRef<HTMLFormElement> | null;
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
    cancelButtonLabel = null,
    submitButtonLabel = null,
    onSubmit = null,
    onCancel = null,
    onCancelHref = null,
    withoutActions = false,
    withoutStatus = false,
    withoutButtons = false,
    withoutSubmitButton = false,
    withCancelButton = false,
    withoutErrors = false,
    canSave = true,
    disabled = false,
    className = null,
    actionsClassName = null,
    buttonGroupClassName = null,
    cancelClassName = null,
    ref = null,
    ...props
}: FormProps) {
    const finalButtons =
        buttons !== null ? (
            <Buttons items={buttons} className={buttonGroupClassName} />
        ) : (
            <div
                className={classNames([
                    'ms-auto d-flex align-items-center',
                    {
                        'btn-group': !withoutButtonGroup,
                    },
                    buttonGroupClassName,
                ])}
            >
                {withCancelButton ? (
                    <Button
                        type="button"
                        onClick={onCancel}
                        href={onCancelHref}
                        theme="secondary"
                        size={buttonSize as ButtonSize}
                        disabled={status === 'loading'}
                        className={classNames([
                            {
                                'me-2': withoutButtonGroup,
                            },
                            cancelClassName,
                        ])}
                        label={
                            cancelButtonLabel ?? (
                                <FormattedMessage
                                    defaultMessage="Cancel"
                                    description="Button label"
                                />
                            )
                        }
                    />
                ) : null}
                {!withoutSubmitButton ? (
                    <Button
                        type="submit"
                        theme="primary"
                        size={buttonSize as ButtonSize}
                        label={
                            submitButtonLabel ?? (
                                <FormattedMessage
                                    defaultMessage="Save"
                                    description="Button label"
                                />
                            )
                        }
                        // icon={status === 'loading' ? 'loading' : 'check'}
                        // iconPosition="right"
                        disabled={!canSave || (status === 'loading' && generalError === null)}
                        outline={!canSave}
                        className={classNames({
                            'ms-auto': actions === null,
                        })}
                    />
                ) : null}
            </div>
        );
    return (
        <form
            action={action || undefined}
            method={method}
            onSubmit={onSubmit || undefined}
            className={className || undefined}
            ref={ref}
            {...props}
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
            {!withoutActions ? (
                <div className={classNames(['mt-4 d-flex align-items-center', actionsClassName])}>
                    {!withoutStatus ? <FormStatus status={status} /> : null}
                    {!withoutButtons ? actions || finalButtons : null}
                </div>
            ) : null}
        </form>
    );
}

export default Form;
