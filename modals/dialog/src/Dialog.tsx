import classNames from 'classnames';
import { type ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';

import type { ButtonSize, Button as ButtonType, Label as LabelType } from '@panneau/core';
import { isMessage } from '@panneau/core/utils';
import Button from '@panneau/element-button';
import Buttons from '@panneau/element-buttons';
import Label from '@panneau/element-label';
import Modal, { type ModalProps } from '@panneau/element-modal';

interface ModalDialogProps extends Omit<ModalProps, 'title'> {
    id: string;
    title?: LabelType | null;
    size?: string | null;
    header?: ReactNode | null;
    children?: ReactNode | null;
    footer?: ReactNode | null;
    buttons?: ButtonType[] | null;
    buttonsSize?: ButtonSize | null;
    submitButtonLabel?: LabelType | null;
    cancelButtonLabel?: LabelType | null;
    cancelButton?: Partial<ButtonType> | null;
    submitButton?: Partial<ButtonType> | null;
    withSubmitButton?: boolean;
    withCancelButton?: boolean;
    withCloseOutside?: boolean;
    withoutClose?: boolean;
    className?: string | null;
    headerClassName?: string | null;
    bodyClassName?: string | null;
    footerClassName?: string | null;
    buttonsClassName?: string | null;
    onClickSubmit?: (() => void) | null;
    onClickCancel?: (() => void) | null;
}

function ModalDialog({
    id,
    title = null,
    size = null,
    header = null,
    children = null,
    buttons = null,
    buttonsSize = null,
    submitButtonLabel = null,
    cancelButtonLabel = null,
    cancelButton = null,
    submitButton = null,
    footer = null,
    requestClose = null,
    withoutClose = false,
    withCloseOutside = false,
    className = null,
    headerClassName = null,
    bodyClassName = null,
    footerClassName = null,
    buttonsClassName = null,
    withCancelButton = false,
    withSubmitButton = false,
    onClickCancel = null,
    onClickSubmit = null,
    ...props
}: ModalDialogProps) {
    const onCloseButtonOutside = (header === null && title === null) || withCloseOutside;

    const finalButtons =
        buttons ||
        ([
            withCancelButton
                ? {
                      label: cancelButtonLabel ?? (
                          <FormattedMessage defaultMessage="Cancel" description="Button label" />
                      ),
                      onClick: onClickCancel || requestClose || undefined,
                      theme: 'secondary',
                      ...cancelButton,
                  }
                : null,
            withSubmitButton
                ? {
                      label: submitButtonLabel ?? (
                          <FormattedMessage defaultMessage="Save" description="Button label" />
                      ),
                      theme: 'primary',
                      onClick: onClickSubmit || undefined,
                      ...submitButton,
                  }
                : null,
        ].filter((button) => button !== null) as ButtonType[]);
    const hasButtons = finalButtons !== null && finalButtons.length > 0;

    return (
        <Modal id={id} requestClose={requestClose} {...props}>
            <div
                className={classNames([
                    'modal-dialog',
                    {
                        [`modal-${size}`]: size !== null,
                    },
                    className,
                ])}
                role="dialog"
            >
                <div className="modal-content">
                    {onCloseButtonOutside && !withoutClose ? (
                        <Button
                            type="button"
                            className={classNames([
                                'btn',
                                'btn-close',
                                'bg-light',
                                'position-absolute',
                                'start-100',
                                'ms-1',
                            ])}
                            aria-label="Close"
                            onClick={requestClose}
                        />
                    ) : null}
                    {header !== null ? (
                        header
                    ) : (
                        <div
                            className={classNames([
                                {
                                    'modal-header': title !== null,
                                },
                                headerClassName,
                            ])}
                        >
                            {title !== null ? (
                                <h5 className="modal-title pe-2">
                                    {isMessage(title) ? <Label>{title}</Label> : title}
                                </h5>
                            ) : null}
                            {title !== null && !withoutClose && !onCloseButtonOutside ? (
                                <Button
                                    type="button"
                                    className="btn-close"
                                    aria-label="Close"
                                    onClick={requestClose}
                                />
                            ) : null}
                        </div>
                    )}
                    <div className={classNames(['modal-body', bodyClassName])}>{children}</div>
                    {footer !== null || hasButtons ? (
                        <div className={classNames(['modal-footer', footerClassName])}>
                            {footer !== null ? footer : null}
                            {hasButtons ? (
                                <Buttons
                                    items={finalButtons}
                                    size={buttonsSize}
                                    className={buttonsClassName}
                                />
                            ) : null}
                        </div>
                    ) : null}
                </div>
            </div>
        </Modal>
    );
}

export default ModalDialog;
