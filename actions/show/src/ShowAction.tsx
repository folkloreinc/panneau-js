/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import React, { useCallback, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { useModalsComponentsManager } from '@panneau/core/contexts';
import { useActionProps } from '@panneau/core/hooks';
import type { ButtonTheme } from '@panneau/core/types';
import Button from '@panneau/element-button';

interface ShowActionProps {
    id: string;
    title?: React.ReactNode | null;
    description?: React.ReactNode | null;
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
    className?: string | null;
}

function ShowAction({
    id,
    title = null,
    description = null,
    endpoint = '/show',
    action = null,
    label = null,
    icon = 'eye',
    value = null,
    theme = 'infor',
    disabled = false,
    onClick = null,
    onConfirmed = null,
    valueLabelPath = null,
    modalComponent = 'dialog',
    withConfirmation = false,
    className = null,
    ...props
}: ShowActionProps) {
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
