import { type ReactNode, useCallback, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import Dialog from '@panneau/modal-dialog';

interface ConfirmModalProps {
    id: string | number;
    title?: ReactNode | null;
    onConfirm?: (() => void) | null;
    onClosed?: (() => void) | null;
    confirmButton?: {
        label?: string;
    } | null;
    cancelButton?: {
        label?: string;
    } | null;
    className?: string | null;
    children?: ReactNode | null;
}

function ConfirmModal({
    id,
    title = null,
    onConfirm = null,
    onClosed = null,
    confirmButton = null,
    cancelButton = null,
    className = null,
    children = null,
}: ConfirmModalProps) {
    const [opened, setOpened] = useState(true);
    const [confirmed, setConfirmed] = useState(false);
    const requestClose = () => {
        setOpened(false);
    };
    const onModalClosed = useCallback(() => {
        if (confirmed && onConfirm !== null) {
            onConfirm();
        } else if (!confirmed && onClosed !== null) {
            onClosed();
        }
    }, [confirmed, onConfirm, onClosed]);
    const onClickCancel = useCallback(() => {
        setConfirmed(false);
        setOpened(false);
    }, []);
    const onClickConfirm = useCallback(() => {
        setConfirmed(true);
        setOpened(false);
    }, []);
    return (
        <Dialog
            id={id}
            title={title}
            size="lg"
            visible={opened}
            requestClose={requestClose}
            onClosed={onModalClosed}
            className={className}
            buttons={[
                {
                    id: 'no',
                    name: 'no',
                    label: <FormattedMessage defaultMessage="No" description="Button label" />,
                    theme: 'secondary',
                    onClick: onClickCancel,
                    ...cancelButton,
                },
                {
                    id: 'yes',
                    name: 'yes',
                    label: <FormattedMessage defaultMessage="Yes" description="Button label" />,
                    theme: 'primary',
                    onClick: onClickConfirm,
                    ...confirmButton,
                },
            ]}
        >
            {children}
        </Dialog>
    );
}

export default ConfirmModal;
