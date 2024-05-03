/* eslint-disable react/jsx-props-no-spreading */
import { getCSRFHeaders, postJSON } from '@folklore/fetch';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { useModalsComponentsManager } from '@panneau/core/contexts';
import { useActionProps } from '@panneau/core/hooks';
import Button from '@panneau/element-button';

// import Confirm from '@panneau/modal-confirm';

const propTypes = {
    id: PropTypes.string.isRequired,
    title: PropTypes.node,
    description: PropTypes.node,
    endpoint: PropTypes.string,
    action: PropTypes.func, // Promise
    label: PropTypes.string,
    value: PropTypes.bool,
    icon: PropTypes.string,
    theme: PropTypes.string,
    disabled: PropTypes.bool,
    onClick: PropTypes.func,
    onChange: PropTypes.func,
    onConfirmed: PropTypes.func,
    valueLabelPath: PropTypes.string,
    modalComponent: PropTypes.string,
    withConfirmation: PropTypes.bool,
    className: PropTypes.string,
};

const defaultProps = {
    title: null,
    description: null,
    endpoint: '/delete',
    action: null,
    label: <FormattedMessage defaultMessage="Delete" description="Button label" />,
    icon: 'trash',
    value: null,
    theme: 'primary',
    disabled: false,
    onClick: null,
    onChange: null,
    onConfirmed: null,
    modalComponent: 'confirm',
    valueLabelPath: null,
    withConfirmation: false,
    className: null,
};

const DeleteAction = ({
    id,
    title,
    description,
    endpoint,
    action,
    label,
    icon,
    value,
    theme,
    disabled,
    onClick,
    onChange,
    onConfirmed,
    modalComponent,
    valueLabelPath,
    withConfirmation,
    className,
    ...props
}) => {
    const ModalComponents = useModalsComponentsManager();
    const ModalComponent = ModalComponents.getComponent(modalComponent);

    const [modalOpen, setModalOpen] = useState(false);

    const [error, setError] = useState(null);

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
                .catch((err) => {
                    setError(err);
                }),
        [ids, endpoint, onChange, onClose, setError, withConfirmation],
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
};

DeleteAction.propTypes = propTypes;
DeleteAction.defaultProps = defaultProps;

export default DeleteAction;
