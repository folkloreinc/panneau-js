import { getCSRFHeaders, postJSON } from '@folklore/fetch';
import classNames from 'classnames';
import { type ReactNode, useCallback, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { useActionProps } from '@panneau/action-actions';
import type { ButtonTheme } from '@panneau/core';
import { useModalsComponentsManager } from '@panneau/core/contexts';
import Button from '@panneau/element-button';

interface DuplicateActionProps {
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
    onChange?: ((response: unknown) => void) | null;
    onConfirmed?: ((response: unknown) => void) | null;
    valueLabelPath?: string | null;
    modalComponent?: string;
    withConfirmation?: boolean;
    className?: string | null;
}

function DuplicateAction({
    id,
    title = null,
    description = null,
    endpoint = '/duplicate',
    action = null,
    label: initialLabel = null,
    icon = 'copy',
    value = null,
    theme = 'secondary',
    disabled = false,
    onChange = null,
    onConfirmed = null,
    valueLabelPath = null,
    modalComponent = 'confirm',
    withConfirmation = false,
    className = null,
    ...props
}: DuplicateActionProps) {
    const label = initialLabel || (
        <FormattedMessage defaultMessage="Duplicate" description="Button label" />
    );
    const ModalComponents = useModalsComponentsManager();
    const ModalComponent = ModalComponents.getComponent(modalComponent);

    const [modalOpen, setModalOpen] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const { ids, idLabels, modalKey } = useActionProps(id, value, valueLabelPath);

    const onOpen = useCallback(() => {
        setModalOpen(true);
    }, [setModalOpen]);

    const onClosed = useCallback(() => {
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
                })
                .catch((err: Error) => {
                    setError(err);
                }),
        [ids, endpoint, action, onChange, setError, onConfirmed],
    );

    return (
        <>
            <Button
                className={className}
                label={label}
                icon={icon}
                onClick={withConfirmation ? onOpen : null}
                disabled={disabled}
                theme={disabled ? 'secondary' : theme}
                {...props}
            />
            {modalOpen ? (
                <ModalComponent
                    id={modalKey}
                    title={
                        title || (
                            <FormattedMessage
                                defaultMessage="Duplicate"
                                description="Modal title"
                            />
                        )
                    }
                    onConfirm={onConfirm}
                    onClosed={onClosed}
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
                                defaultMessage="The following items will be duplicated: {ids}. Are you sure you want to continue?"
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

export default DuplicateAction;
