import isObject from 'lodash/isObject';
import { useCallback, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import type { ActionValue, ButtonTheme } from '@panneau/core';
import { useModalComponent, useResource } from '@panneau/core/contexts';
import { useResourceUrlGenerator } from '@panneau/core/hooks';
import Button from '@panneau/element-button';

interface EditActionProps {
    id: string;
    href?: string | null;
    label?: string | null;
    value?: ActionValue | null;
    icon?: string;
    theme?: ButtonTheme;
    disabled?: boolean;
    multiple?: boolean;
    onChange?: ((value: ActionValue) => void) | null;
    modalComponent?: string;
    withModal?: boolean;
    withDefaultLabel?: boolean;
    className?: string | null;
}

function EditAction({
    id,
    href: initialHref = null,
    label: initialLabel = null,
    icon = 'pencil',
    value = null,
    theme = 'primary',
    disabled = false,
    multiple = false,
    onChange = null,
    modalComponent = null,
    withModal = false,
    withDefaultLabel = false,
    className = null,
    ...props
}: EditActionProps) {
    const resource = useResource();
    const resourceUrl = useResourceUrlGenerator();
    const finalHref =
        initialHref || (!multiple && isObject(value) ? resourceUrl('edit', value) : null);
    const label =
        initialLabel ||
        (withDefaultLabel ? (
            <FormattedMessage defaultMessage="Edit" description="Button label" />
        ) : null);
    const ModalComponent = useModalComponent(
        modalComponent || (resource !== null ? 'resource-form' : 'form'),
    );
    const [modalOpen, setModalOpen] = useState(false);

    const onOpen = useCallback(() => {
        setModalOpen(true);
    }, [setModalOpen]);

    const onClosed = useCallback(() => {
        setModalOpen(false);
    }, [setModalOpen]);

    const onComplete = useCallback(
        (newValue: ActionValue) => {
            if (onChange !== null) {
                onChange(newValue);
            }
        },
        [onChange],
    );

    return (
        <>
            <Button
                className={className}
                label={label}
                icon={icon}
                onClick={withModal ? onOpen : null}
                disabled={disabled}
                theme={theme}
                href={!withModal ? finalHref : null}
                {...props}
            />
            {modalOpen ? (
                <ModalComponent
                    title={
                        multiple ? (
                            <FormattedMessage
                                defaultMessage="Edit items"
                                description="Modal title"
                            />
                        ) : (
                            <FormattedMessage
                                defaultMessage="Edit item"
                                description="Modal title"
                            />
                        )
                    }
                    resource={resource}
                    value={value}
                    onClosed={onClosed}
                    onComplete={onComplete}
                    {...props}
                />
            ) : null}
        </>
    );
}

export default EditAction;
