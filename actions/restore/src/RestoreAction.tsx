import { getCSRFHeaders, postJSON } from '@folklore/fetch';
import isArray from 'lodash-es/isArray';
import { type ReactNode, useCallback, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import type { ActionValue, ButtonTheme } from '@panneau/core';
import { useModalsComponentsManager } from '@panneau/core/contexts';
import Button from '@panneau/element-button';

interface RestoreActionProps {
    id: string;
    title?: ReactNode | null;
    description?: ReactNode | null;
    endpoint?: string;
    endpointIdsParamName?: string;
    action?: ((value: ActionValue) => Promise<unknown>) | null;
    label?: string | null;
    value?: ActionValue | null;
    icon?: string;
    theme?: ButtonTheme;
    disabled?: boolean;
    multiple?: boolean;
    onConfirmed?: ((response: unknown) => void) | null;
    valueLabelPath?: string | null;
    modalComponent?: string;
    withoutConfirmation?: boolean;
    onClick?: (() => void) | null;
    className?: string | null;
}

function RestoreAction({
    id,
    title = null,
    description = null,
    endpoint = '/restore',
    endpointIdsParamName = 'ids',
    action = null,
    label = null,
    icon = 'box-arrow-left',
    value = null,
    theme = 'warning',
    disabled = false,
    multiple = false,
    onConfirmed = null,
    valueLabelPath = null,
    modalComponent = 'confirm',
    withoutConfirmation = false,
    onClick = null,
    className = null,
    ...props
}: RestoreActionProps) {
    const ModalComponents = useModalsComponentsManager();
    const ModalComponent = ModalComponents.getComponent(modalComponent);

    const [modalOpen, setModalOpen] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const onOpen = useCallback(() => {
        setModalOpen(true);
    }, [setModalOpen]);

    const onClosed = useCallback(() => {
        setModalOpen(false);
    }, [setModalOpen]);

    const onConfirm = useCallback(
        () =>
            (action !== null
                ? action(value)
                : postJSON(
                      endpoint,
                      {
                          [endpointIdsParamName]: (isArray(value) ? value : [value])
                              .filter((it) => it !== null)
                              .map((it) => it?.id),
                      },
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
                })
                .catch((err: Error) => {
                    setError(err);
                }),
        [value, endpoint, setError, action, onConfirmed, endpointIdsParamName],
    );

    return (
        <>
            <Button
                className={className}
                label={label}
                icon={icon}
                onClick={onClick ?? (withoutConfirmation ? onConfirm : onOpen)}
                disabled={disabled}
                theme={disabled ? 'secondary' : theme}
                {...props}
            />
            {modalOpen ? (
                <ModalComponent
                    title={
                        title || (
                            <FormattedMessage defaultMessage="Restore" description="Modal title" />
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
                            {multiple ? (
                                <FormattedMessage
                                    defaultMessage="The following item will be restored: {id}. Are you sure you want to continue?"
                                    description="Modal message"
                                    values={{
                                        id:
                                            value !== null && !isArray(value)
                                                ? `#${value?.id}`
                                                : '',
                                    }}
                                />
                            ) : (
                                <FormattedMessage
                                    defaultMessage="The following items will be restored: {ids}. Are you sure you want to continue?"
                                    description="Modal message"
                                    values={{
                                        ids:
                                            value !== null && isArray(value)
                                                ? value.map((it) => `#${it?.id}`).join(', ')
                                                : '',
                                    }}
                                />
                            )}
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
