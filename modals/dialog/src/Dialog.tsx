import { type ReactNode } from 'react';
import classNames from 'classnames';

import type { Button as ButtonType, Label as LabelType } from '@panneau/core/types';
import { isMessage } from '@panneau/core/utils';
import Button from '@panneau/element-button';
import Buttons from '@panneau/element-buttons';
import Label from '@panneau/element-label';
import Modal from '@panneau/element-modal';

import styles from './styles.module.css';

interface ModalDialogProps {
    id: string | number;
    title?: LabelType | null;
    size?: string | null;
    header?: ReactNode | null;
    children?: ReactNode | null;
    footer?: ReactNode | null;
    buttons?: ButtonType[] | null;
    onClose?: (() => void) | null;
    withCloseOutside?: boolean;
    className?: string | null;
}

function ModalDialog({
    id,
    title = null,
    size = null,
    header = null,
    children = null,
    buttons = null,
    footer = null,
    onClose = null,
    withCloseOutside = false,
    className = null,
}: ModalDialogProps) {
    const onCloseButtonOutside =
        (header === null && title === null && onClose !== null) ||
        (withCloseOutside && onClose !== null);

    return (
        <Modal id={id} onClose={onClose}>
            <div
                className={classNames([
                    'modal-dialog',
                    styles.container,
                    {
                        [`modal-${size}`]: size !== null,
                        [styles.closeOutside]: onCloseButtonOutside,
                        [className!]: className !== null,
                    },
                ])}
                role="dialog"
            >
                <div className="modal-content">
                    {onCloseButtonOutside ? (
                        <Button
                            type="button"
                            className={classNames([
                                styles.closeOutsideButton,
                                'btn',
                                'btn-close',
                                'bg-light',
                                // 'btn-close-white',
                                'btn-secondary',
                                'p-2',
                            ])}
                            aria-label="Close"
                            onClick={onClose}
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
                            ])}
                        >
                            {title !== null ? (
                                <h5 className="modal-title pe-2">
                                    {isMessage(title) ? <Label>{title}</Label> : title}
                                </h5>
                            ) : null}
                            {title !== null && onClose !== null ? (
                                <Button
                                    type="button"
                                    className={classNames(['btn-close', 'close'])}
                                    aria-label="Close"
                                    onClick={onClose}
                                />
                            ) : null}
                        </div>
                    )}
                    <div className={classNames(['modal-body', styles.body])}>{children}</div>
                    {footer !== null || buttons !== null ? (
                        <div className={classNames(['modal-footer', styles.footer])}>
                            {footer !== null ? footer : null}
                            {buttons !== null ? (
                                <Buttons items={buttons} className={styles.buttons} />
                            ) : null}
                        </div>
                    ) : null}
                </div>
            </div>
        </Modal>
    );
}

export default ModalDialog;
