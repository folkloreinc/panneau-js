/* eslint-disable react/jsx-props-no-spreading */
import { getCSRFHeaders, postJSON } from '@folklore/fetch';
import React, { useCallback, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { useModalsComponentsManager } from '@panneau/core/contexts';
import { useActionProps } from '@panneau/core/hooks';
import type { ButtonTheme } from '@panneau/core/types';
import Button from '@panneau/element-button';

interface DeleteActionProps {
    id: string;
    title?: React.ReactNode | null;
    description?: React.ReactNode | null;
    endpoint?: string;
    action?: ((ids: string[]) => Promise<unknown>) | null;
    label?: string | React.ReactNode | null;
    value?: boolean | null;
    icon?: string;
    theme?: ButtonTheme;
    disabled?: boolean;
    onClick?: (() => void) | null;
    onChange?: ((response: unknown) => void) | null;
    onConfirmed?: ((response: unknown) => void) | null;
    valueLabelPath?: string | null;
    modalComponent?: string;
    withConfirmation?: boolean;
    className?: string | null;
}

function DeleteAction({
    id,
    title = null,
    description = null,
    endpoint = '/delete',
    action = null,
    label: initialLabel = null,
    icon = 'trash',
    value = null,
    theme = 'primary',
    disabled = false,
    onClick = null,
    onChange = null,
    onConfirmed = null,
    modalComponent = 'confirm',
    valueLabelPath = null,
    withConfirmation = false,
    className = null,
    ...props
}: DeleteActionProps) {
    const label = initialLabel || (
        <FormattedMessage defaultMessage="Delete" description="Button label" />
    );
    const ModalComponents = useModalsComponentsManager();
    const ModalComponent = ModalComponents.getComponent(modalComponent);

    const [modalOpen, setModalOpen] = useState(false);

    const [error, setError] = useState<Error | null>(null);

    const { ids, idLabels, modalKey } = useActionProps(id, value, valueLabelPath);

    const onOpen = useCallback(() => {
        setModalOpen(true);
    }, [setModalOpen]);

    const onClose = useCallback(() => {
        setModalOpen(false);
    }, [setModalOpen]);

    const onConfirm = useCallback(
        () =>
            (action !== null
                ? action(ids)
                : postJSON(
                      endpoint,
                      { ids },
                      {
                          credentials: 'include',
                          headers: getCSRFHeaders(),
                          _method: 'DELETE',
                      },
                  )
            )
                .then((response) => {
                    if (onConfirmed !== null) {
                        onConfirmed(response);
                    }
                    if (onChange !== null) {
                        onChange(response);
                    }
                    if (withConfirmation) {
                        onClose();
                    }
                })
                .catch((err: Error) => {
                    setError(err);
                }),
        [ids, endpoint, onChange, onClose, setError, withConfirmation, action, onConfirmed],
    );

    return (
        <>
            <Button
                className={className}
                label={label}
                icon={icon}
                onClick={withConfirmation ? onOpen : onClick || onConfirm}
                disabled={disabled}
                theme={disabled ? 'secondary' : theme}
                {...props}
            />
            {modalOpen ? (
                <ModalComponent
                    id={modalKey}
                    title={
                        title || (
                            <FormattedMessage defaultMessage="Delete" description="Modal title" />
                        )
                    }
                    onConfirm={onConfirm}
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
                    {description !== null ? (
                        description
                    ) : (
                        <p>
                            <FormattedMessage
                                defaultMessage="The following items will be deleted: {ids}. Are you sure you want to continue?"
                                description="Modal message"
                                values={{ ids: idLabels }}
                            />
                        </p>
                    )}
                    {error !== null ? (
                        <FormattedMessage
                            defaultMessage="An error has occured."
                            description="Modal message"
                        />
                    ) : null}
                </ModalComponent>
            ) : null}
        </>
    );
}

export default DeleteAction;
