/* eslint-disable react/jsx-props-no-spreading */
import { getCSRFHeaders, postJSON } from '@folklore/fetch';
import classNames from 'classnames';
import React, { useCallback, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { useModalsComponentsManager } from '@panneau/core/contexts';
import { useActionProps } from '@panneau/core/hooks';
import type { ButtonTheme } from '@panneau/core/types';
import Button from '@panneau/element-button';

interface RestoreActionProps {
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
    onConfirmed?: ((response: unknown) => void) | null;
    valueLabelPath?: string | null;
    modalComponent?: string;
    withConfirmation?: boolean;
    className?: string | null;
}

function RestoreAction({
    id,
    title = null,
    description = null,
    endpoint = '/restore',
    action = null,
    label = null,
    icon = 'box-arrow-left',
    value = null,
    theme = 'warning',
    disabled = false,
    onConfirmed = null,
    valueLabelPath = null,
    modalComponent = 'confirm',
    withConfirmation = false,
    className = null,
    ...props
}: RestoreActionProps) {
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
                    if (withConfirmation) {
                        onClose();
                    }
                })
                .catch((err: Error) => {
                    setError(err);
                }),
        [ids, endpoint, onClose, setError, withConfirmation, action, onConfirmed],
    );

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
                onClick={withConfirmation ? onOpen : onConfirm}
                disabled={disabled}
                theme={disabled ? 'secondary' : theme}
                {...props}
            />
            {modalOpen ? (
                <ModalComponent
                    id={modalKey}
                    title={
                        title || (
                            <FormattedMessage defaultMessage="Restore" description="Modal title" />
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
                                defaultMessage="The following items will be restored: {ids}. Are you sure you want to continue?"
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

export default RestoreAction;
