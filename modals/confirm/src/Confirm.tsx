import React from 'react';
import { FormattedMessage } from 'react-intl';

import Dialog from '@panneau/modal-dialog';

interface ConfirmModalProps {
    id: string | number;
    title?: React.ReactNode | null;
    onConfirm?: (() => void) | null;
    onClose?: (() => void) | null;
    confirmButton?: {
        label?: string;
    } | null;
    cancelButton?: {
        label?: string;
    } | null;
    className?: string | null;
    children?: React.ReactNode | null;
}

function ConfirmModal({
    id,
    title = null,
    onConfirm = null,
    onClose = null,
    confirmButton = null,
    cancelButton = null,
    className = null,
    children = null
}: ConfirmModalProps)  {
    return (
        <Dialog
            id={id}
            title={title}
            size="lg"
            onClose={onClose}
            className={className}
            buttons={[
                {
                    id: 'no',
                    name: 'no',
                    label: <FormattedMessage defaultMessage="No" description="Button label" />,
                    theme: 'secondary',
                    onClick: onClose,
                    ...cancelButton,
                },
                {
                    id: 'yes',
                    name: 'yes',
                    label: <FormattedMessage defaultMessage="Yes" description="Button label" />,
                    theme: 'primary',
                    onClick: onConfirm,
                    ...confirmButton,
                },
            ]}
        >
            {children}
        </Dialog>
    );
}

export default ConfirmModal;
