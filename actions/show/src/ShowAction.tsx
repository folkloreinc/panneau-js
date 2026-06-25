import isObject from 'lodash-es/isObject';
import { useCallback, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import type { ActionValue, ButtonTheme, Resource } from '@panneau/core';
import { useModalComponent, useResource } from '@panneau/core/contexts';
import { useResourceUrlGenerator } from '@panneau/core/hooks';
import Button from '@panneau/element-button';

interface ShowActionProps {
    id: string;
    resource?: Resource | string | null;
    href?: string | null;
    label?: string | null;
    value?: ActionValue;
    icon?: string;
    theme?: ButtonTheme;
    disabled?: boolean;
    multiple?: boolean;
    onClick?: (() => void) | null;
    valueLabelPath?: string | null;
    modalComponent?: string;
    withModal?: boolean;
    withDefaultLabel?: boolean;
    className?: string | null;
}

function ShowAction({
    id,
    resource: initialResource = null,
    label: initialLabel = null,
    href: initialHref = null,
    icon = 'eye',
    value = null,
    theme = 'info',
    disabled = false,
    multiple = false,
    onClick = null,
    valueLabelPath = null,
    modalComponent = 'dialog',
    withModal = false,
    withDefaultLabel = false,
    className = null,
    ...props
}: ShowActionProps) {
    const contextResource = useResource();
    const resource = initialResource || contextResource;
    const resourceUrl = useResourceUrlGenerator(resource);
    const finalHref =
        initialHref || (!multiple && isObject(value) ? resourceUrl('show', value) : null);
    const label =
        initialLabel ||
        (withDefaultLabel ? (
            <FormattedMessage defaultMessage="Show" description="Button label" />
        ) : null);

    const ModalComponent = useModalComponent(modalComponent);

    const [modalOpen, setModalOpen] = useState(false);

    const onOpen = useCallback(() => {
        setModalOpen(true);
    }, [setModalOpen]);

    const onClosed = useCallback(() => {
        setModalOpen(false);
    }, [setModalOpen]);

    return (
        <>
            <Button
                className={className}
                label={label}
                icon={icon}
                onClick={withModal && ModalComponent !== null ? onOpen : onClick}
                disabled={disabled}
                theme={disabled ? 'secondary' : theme}
                href={finalHref}
                {...props}
            />
            {modalOpen ? (
                <ModalComponent id={`${id}-modal`} value={value} onClosed={onClosed} {...props} />
            ) : null}
        </>
    );
}

export default ShowAction;
