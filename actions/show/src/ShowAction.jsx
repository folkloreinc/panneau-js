/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { useModalsComponentsManager } from '@panneau/core/contexts';
import { useActionProps } from '@panneau/core/hooks';
import Button from '@panneau/element-button';

import styles from './styles.module.scss';

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
    valueLabelPath: PropTypes.string,
    modalComponent: PropTypes.string,
    withConfirmation: PropTypes.bool,
    className: PropTypes.string,
};

const defaultProps = {
    title: null,
    description: null,
    endpoint: '/show',
    action: null,
    label: null,
    icon: 'eye',
    value: null,
    theme: 'infor',
    disabled: false,
    onClick: null,
    valueLabelPath: null,
    modalComponent: 'dialog',
    withConfirmation: false,
    className: null,
};

const ShowAction = ({
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
    valueLabelPath,
    modalComponent,
    withConfirmation,
    className,
    ...props
}) => {
    const ModalComponents = useModalsComponentsManager();
    const ModalComponent = ModalComponents.getComponent(modalComponent);

    const [modalOpen, setModalOpen] = useState(false);

    const { modalKey } = useActionProps(id, value, valueLabelPath);

    const onOpen = useCallback(() => {
        setModalOpen(true);
    }, [setModalOpen]);

    const onClose = useCallback(() => {
        setModalOpen(false);
    }, [setModalOpen]);

    return (
        <>
            <Button
                className={classNames([
                    styles.container,
                    {
                        [className]: className !== null,
                    },
                ])}
                label={label}
                icon={icon}
                onClick={withConfirmation ? onOpen : onClick}
                disabled={disabled}
                theme={disabled ? 'secondary' : theme}
                {...props}
            />
            {modalOpen ? (
                <ModalComponent
                    id={modalKey}
                    title={
                        title || (
                            <FormattedMessage defaultMessage="Preview" description="Modal title" />
                        )
                    }
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
                    Show Something
                </ModalComponent>
            ) : null}
        </>
    );
};

ShowAction.propTypes = propTypes;
ShowAction.defaultProps = defaultProps;

export default ShowAction;
