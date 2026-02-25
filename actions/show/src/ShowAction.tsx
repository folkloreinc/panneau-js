import classNames from 'classnames';
import { type ReactNode, useCallback, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { useActionProps } from '@panneau/action-actions';
import { useModalsComponentsManager } from '@panneau/core/contexts';
import type { ButtonTheme } from '@panneau/core';
import Button from '@panneau/element-button';

interface ShowActionProps {
    id: string;
    title?: ReactNode | null;
    description?: ReactNode | null;
    endpoint?: string;
    action?: ((ids: string[]) => Promise<unknown>) | null;
    label?: string | null;
    value?: boolean | null;
    icon?: string;
    theme?: ButtonTheme;
    disabled?: boolean;
    onClick?: (() => void) | null;
    onConfirmed?: ((response: unknown) => void) | null;
    valueLabelPath?: string | null;
    modalComponent?: string;
    withConfirmation?: boolean;
    withDefaultLabel?: boolean;
    className?: string | null;
}

function ShowAction({
    id,
    title = null,
    description: _description = null,
    endpoint: _endpoint = '/show',
    action: _action = null,
    label: initialLabel = null,
    icon = 'eye',
    value = null,
    theme = 'infor',
    disabled = false,
    onClick = null,
    onConfirmed: _onConfirmed = null,
    valueLabelPath = null,
    modalComponent = 'dialog',
    withConfirmation = false,
    withDefaultLabel = false,
    className = null,
    ...props
}: ShowActionProps) {
    const label =
        initialLabel ||
        (withDefaultLabel ? (
            <FormattedMessage defaultMessage="Show" description="Button label" />
        ) : null);

    const ModalComponents = useModalsComponentsManager();
    const ModalComponent = ModalComponents.getComponent(modalComponent);

    const [modalOpen, setModalOpen] = useState(false);
    const { modalKey } = useActionProps(id, value, valueLabelPath);

    const onOpen = useCallback(() => {
        setModalOpen(true);
    }, [setModalOpen]);

    const onClose = useCallback(() => {
        setModalOpen(false);
    }, [setModalOpen]);

    return (
        <>
            <Button
                className={classNames([
                    {
                        [className!]: className !== null,
                    },
                ])}
                label={label}
                icon={icon}
                onClick={withConfirmation ? onOpen : onClick}
                disabled={disabled}
                theme={disabled ? 'secondary' : theme}
                {...props}
            />
            {modalOpen ? (
                <ModalComponent
                    id={modalKey}
                    title={
                        title || (
                            <FormattedMessage defaultMessage="Preview" description="Modal title" />
                        )
                    }
                    onClose={onClose}
                    confirmButton={{
                        label: (
                            <FormattedMessage defaultMessage="Confirm" description="Button label" />
                        ),
                        theme: 'danger',
                    }}
                    cancelButton={{
                        label: (
                            <FormattedMessage defaultMessage="Cancel" description="Button label" />
                        ),
                    }}
                >
                    Show Something
                </ModalComponent>
            ) : null}
        </>
    );
}

export default ShowAction;
