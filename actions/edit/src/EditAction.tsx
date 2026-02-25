import classNames from 'classnames';
import { type ReactNode, useCallback, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { useActionProps } from '@panneau/action-actions';
import type { ButtonTheme, Field } from '@panneau/core';
import { useModalsComponentsManager } from '@panneau/core/contexts';
import Button from '@panneau/element-button';

interface EditActionProps {
    id: string;
    title?: ReactNode | null;
    description?: ReactNode | null;
    fields?: Field[] | null;
    endpoint?: string | null;
    label?: string | null;
    value?: boolean | null;
    icon?: string;
    theme?: ButtonTheme;
    disabled?: boolean;
    onChange?: ((value: unknown) => void) | null;
    onConfirmed?: ((value: unknown) => void) | null;
    valueLabelPath?: string | null;
    modalComponent?: string;
    withConfirmation?: boolean;
    withDefaultLabel?: boolean;
    className?: string | null;
}

function EditAction({
    id,
    title = null,
    description = null,
    fields = null,
    endpoint = null,
    label: initialLabel = null,
    icon = 'pencil',
    value = null,
    theme = 'primary',
    disabled = false,
    onChange = null,
    onConfirmed = null,
    valueLabelPath = null,
    modalComponent = 'form',
    withConfirmation = false,
    withDefaultLabel = false,
    className = null,
    ...props
}: EditActionProps) {
    const label =
        initialLabel ||
        (withDefaultLabel ? (
            <FormattedMessage defaultMessage="Edit" description="Button label" />
        ) : null);
    const ModalComponents = useModalsComponentsManager();
    const ModalComponent = ModalComponents.getComponent(modalComponent);

    const [modalOpen, setModalOpen] = useState(false);
    const [error, setError] = useState<boolean | null>(null);

    const { ids, idLabels, modalKey } = useActionProps(id, value, valueLabelPath);

    const onOpen = useCallback(() => {
        setModalOpen(true);
    }, [setModalOpen]);

    const onClose = useCallback(() => {
        setModalOpen(false);
    }, [setModalOpen]);

    const onComplete = useCallback(
        (newValue: unknown) => {
            setModalOpen(false);
            if (onConfirmed !== null) {
                onConfirmed(newValue);
            }
            if (onChange !== null) {
                onChange(newValue);
            }
        },
        [onChange, onConfirmed, setModalOpen],
    );

    const onError = useCallback(() => {
        setError(true);
    }, [setError]);

    const multipleValues = useMemo(() => value !== null && value.length > 1, [value]);

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
                onClick={withConfirmation ? onOpen : null}
                disabled={disabled}
                theme={disabled ? 'secondary' : theme}
                {...props}
            />
            {modalOpen ? (
                <ModalComponent
                    id={modalKey}
                    title={
                        title ||
                        (multipleValues ? (
                            <FormattedMessage
                                defaultMessage="Edit items"
                                description="Modal title"
                            />
                        ) : (
                            <FormattedMessage
                                defaultMessage="Edit item"
                                description="Modal title"
                            />
                        ))
                    }
                    onClose={onClose}
                    onComplete={onComplete}
                    onError={onError}
                    postData={{ ids }}
                    fields={fields}
                    action={endpoint}
                >
                    {description || (
                        <p>
                            <FormattedMessage
                                defaultMessage="The following items will be modified: {ids}."
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

export default EditAction;
