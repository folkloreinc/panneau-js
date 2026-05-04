import classNames from 'classnames';
import { type ReactNode } from 'react';

import type { Button as ButtonType, Label as LabelType } from '@panneau/core';
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
    withCloseOutside?: boolean;
    withoutClose?: boolean;
    className?: string | null;
    headerClassName?: string | null;
    bodyClassName?: string | null;
    footerClassName?: string | null;
    buttonsClassName?: string | null;
}

function ModalDialog({
    id,
    title = null,
    size = null,
    header = null,
    children = null,
    buttons = null,
    footer = null,
    requestClose = null,
    withoutClose = false,
    withCloseOutside = false,
    className = null,
    headerClassName = null,
    bodyClassName = null,
    footerClassName = null,
    buttonsClassName = null,
    ...props
}: ModalDialogProps) {
    const onCloseButtonOutside = (header === null && title === null) || withCloseOutside;

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
                    {footer !== null || buttons !== null ? (
                        <div className={classNames(['modal-footer', footerClassName])}>
                            {footer !== null ? footer : null}
                            {buttons !== null ? (
                                <Buttons items={buttons} className={buttonsClassName} />
                            ) : null}
                        </div>
                    ) : null}
                </div>
            </div>
        </Modal>
    );
}

export default ModalDialog;
