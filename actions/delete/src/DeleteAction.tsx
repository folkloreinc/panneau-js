import { getCSRFHeaders, postJSON } from '@folklore/fetch';
import isArray from 'lodash-es/isArray';
import isObject from 'lodash-es/isObject';
import { type ReactNode, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import type { ActionValue, ButtonTheme, Resource } from '@panneau/core';
import { useModalComponent, useResource } from '@panneau/core/contexts';
import { useResourceUrlGenerator } from '@panneau/core/hooks';
import { useResourceDestroy } from '@panneau/data';
import Button from '@panneau/element-button';

interface DeleteActionProps {
    resource?: Resource | string | null;
    title?: ReactNode | null;
    description?: ReactNode | null;
    endpoint?: string;
    endpointIdsParamName?: string;
    action?: ((value: ActionValue) => Promise<unknown>) | null;
    label?: string | ReactNode | null;
    href?: string | null;
    value?: ActionValue | null;
    icon?: string;
    theme?: ButtonTheme;
    multiple?: boolean;
    disabled?: boolean;
    onClick?: (() => void) | null;
    valueLabelPath?: string | null;
    modalComponent?: string;
    withoutConfirmation?: boolean;
    withDefaultLabel?: boolean;
    className?: string | null;
}

function DeleteAction({
    resource: initialResource = null,
    title = null,
    description = null,
    endpoint = null,
    endpointIdsParamName = 'ids',
    action = null,
    label: initialLabel = null,
    href: initialHref = null,
    icon = 'trash',
    value = null,
    theme = 'primary',
    multiple = false,
    disabled = false,
    onClick = null,
    modalComponent = 'confirm',
    valueLabelPath = null,
    withoutConfirmation = false,
    withDefaultLabel = false,
    className = null,
    ...props
}: DeleteActionProps) {
    const contextResource = useResource();
    const resource = initialResource || contextResource;
    const resourceUrl = useResourceUrlGenerator(resource);
    const { destroyAsync } = useResourceDestroy(resource);
    const finalHref =
        initialHref ||
        (!multiple && isObject(value) && !isArray(value) ? resourceUrl('delete', value) : null);
    const label =
        initialLabel ||
        (withDefaultLabel ? (
            <FormattedMessage defaultMessage="Delete" description="Button label" />
        ) : null);
    const ModalComponent = useModalComponent(modalComponent);

    const [modalOpen, setModalOpen] = useState(false);

    const onOpen = () => setModalOpen(true);
    const onClosed = () => setModalOpen(false);

    const deleteAction =
        action ||
        (endpoint !== null
            ? (value) =>
                  postJSON(
                      endpoint,
                      {
                          [endpointIdsParamName]: (isArray(value) ? value : [value])
                              .map((it) => it?.id ?? null)
                              .filter((it) => it !== null),
                          _method: 'DELETE',
                      },
                      {
                          credentials: 'include',
                          headers: getCSRFHeaders(),
                      },
                  )
            : null) ||
        (resource !== null && !multiple)
            ? (value) => destroyAsync(value?.id)
            : null;

    const onConfirm = deleteAction !== null ? () => deleteAction(value) : null;

    return (
        <>
            <Button
                className={className}
                label={label}
                icon={icon}
                onClick={onClick ?? (withoutConfirmation ? onConfirm : onOpen)}
                disabled={disabled}
                theme={theme}
                href={withoutConfirmation ? finalHref : null}
                {...props}
            />
            {modalOpen ? (
                <ModalComponent
                    title={
                        title || (
                            <FormattedMessage defaultMessage="Delete" description="Modal title" />
                        )
                    }
                    onConfirm={onConfirm}
                    onClosed={onClosed}
                >
                    {description !== null ? (
                        description
                    ) : (
                        <p>
                            {multiple ? (
                                <FormattedMessage
                                    defaultMessage="The following item will be deleted: {id}. Are you sure you want to continue?"
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
                                    defaultMessage="The following items will be deleted: {ids}. Are you sure you want to continue?"
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
                </ModalComponent>
            ) : null}
        </>
    );
}

export default DeleteAction;
