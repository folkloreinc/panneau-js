import { getCSRFHeaders, postJSON } from '@folklore/fetch';
import { isObject } from 'lodash';
import isArray from 'lodash-es/isArray';
import { type ReactNode, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import type { ActionValue, ButtonTheme, Resource } from '@panneau/core';
import { useModalsComponentsManager, useResource } from '@panneau/core/contexts';
import { useResourceUrlGenerator } from '@panneau/core/hooks';
import { useResourceClone } from '@panneau/data';
import Button from '@panneau/element-button';

interface DuplicateActionProps {
    resource?: Resource | string | null;
    title?: ReactNode | null;
    description?: ReactNode | null;
    endpoint?: string;
    endpointIdsParamName?: string;
    action?: ((value: ActionValue) => Promise<unknown>) | null;
    label?: string | null;
    href?: string | null;
    value?: ActionValue | null;
    icon?: string;
    theme?: ButtonTheme;
    disabled?: boolean;
    multiple?: boolean;
    onChange?: ((response: unknown) => void) | null;
    onConfirmed?: ((response: unknown) => void) | null;
    valueLabelPath?: string | null;
    modalComponent?: string;
    withoutConfirmation?: boolean;
    onClick?: (() => void) | null;
    className?: string | null;
}

function DuplicateAction({
    resource: initialResource = null,
    title = null,
    description = null,
    endpoint = '/duplicate',
    endpointIdsParamName = 'ids',
    action = null,
    label: initialLabel = null,
    href: initialHref = null,
    icon = 'copy',
    value = null,
    theme = 'secondary',
    disabled = false,
    multiple = false,
    onChange = null,
    onConfirmed = null,
    valueLabelPath = null,
    modalComponent = 'confirm',
    withoutConfirmation = false,
    className = null,
    onClick = null,
    ...props
}: DuplicateActionProps) {
    const contextResource = useResource();
    const resource = initialResource || contextResource;
    const resourceUrl = useResourceUrlGenerator(resource);
    const { cloneAsync } = useResourceClone(resource);
    const label = initialLabel || (
        <FormattedMessage defaultMessage="Duplicate" description="Button label" />
    );
    const finalHref =
        initialHref ||
        (!multiple && isObject(value) && !isArray(value) ? resourceUrl('duplicate', value) : null);
    const ModalComponents = useModalsComponentsManager();
    const ModalComponent = ModalComponents.getComponent(modalComponent);

    const [modalOpen, setModalOpen] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const onOpen = () => {
        setModalOpen(true);
    };

    const onClosed = () => {
        setModalOpen(false);
    };

    const finalAction =
        action ||
        (endpoint !== null
            ? (value) =>
                  postJSON(
                      endpoint,
                      {
                          [endpointIdsParamName]: (isArray(value) ? value : [value])
                              .map((it) => it?.id ?? null)
                              .filter((it) => it !== null),
                      },
                      {
                          credentials: 'include',
                          headers: getCSRFHeaders(),
                      },
                  )
            : null) ||
        (resource !== null && !multiple)
            ? (value) => cloneAsync(value?.id)
            : null;

    const onConfirm = finalAction !== null ? () => finalAction(value) : null;

    return (
        <>
            <Button
                className={className}
                label={label}
                icon={icon}
                onClick={onClick ?? (withoutConfirmation ? onConfirm : onOpen)}
                disabled={disabled}
                theme={disabled ? 'secondary' : theme}
                href={withoutConfirmation ? finalHref : null}
                {...props}
            />
            {modalOpen ? (
                <ModalComponent
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
                            {multiple ? (
                                <FormattedMessage
                                    defaultMessage="The following item will be duplicated: {id}. Are you sure you want to continue?"
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
                                    defaultMessage="The following items will be duplicated: {ids}. Are you sure you want to continue?"
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

export default DuplicateAction;
