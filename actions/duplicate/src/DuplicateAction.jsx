/* eslint-disable react/jsx-props-no-spreading */
import { getCSRFHeaders, postJSON } from '@folklore/fetch';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { useModal } from '@panneau/core/contexts';
import Button from '@panneau/element-button';
import Confirm from '@panneau/modal-confirm';

import styles from './styles.module.scss';

const propTypes = {
    title: PropTypes.node,
    description: PropTypes.node,
    endpoint: PropTypes.string,
    label: PropTypes.string,
    value: PropTypes.bool,
    icon: PropTypes.string,
    theme: PropTypes.string,
    disabled: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    setSelectedItems: PropTypes.func,
    className: PropTypes.string,
};

const defaultProps = {
    title: null,
    description: null,
    endpoint: '/duplicate',
    label: <FormattedMessage defaultMessage="Duplicate" description="Button label" />,
    icon: 'copy',
    value: null,
    theme: 'primary',
    disabled: false,
    setSelectedItems: null,
    className: null,
};

const DuplicateAction = ({
    title,
    description,
    endpoint,
    label,
    icon,
    value,
    theme,
    disabled,
    onChange,
    setSelectedItems,
    className,
    ...props
}) => {
    const { modals = null, register = null, unregister = null } = useModal();

    const [error, setError] = useState(null);

    const ids = useMemo(
        () => (value || []).map(({ id = null } = {}) => id).filter((id) => id !== null),
        [value],
    );
    const idKeys = useMemo(() => (ids || []).map((id) => `${id}`).join('-'), [ids]);
    const idLabels = useMemo(() => (ids || []).map((id) => `#${id}`).join(', '), [ids]);
    const modalKey = useMemo(() => `duplicate-${idKeys}`, [idKeys]);
    const modal = useMemo(
        () => (modals || []).find(({ id = null }) => id === `${modalKey}`) || null,
        [modals, modalKey],
    );

    const onOpen = useCallback(() => {
        register(modalKey);
    }, [modalKey, register]);

    const onClose = useCallback(() => {
        unregister(modalKey);
    }, [modalKey, unregister]);

    const onConfirm = useCallback(() => {
        postJSON(
            endpoint,
            { ids },
            {
                credentials: 'include',
                headers: getCSRFHeaders(),
                _method: 'DELETE',
            },
        )
            .then((response) => {
                if (setSelectedItems !== null) {
                    setSelectedItems([]);
                }
                if (onChange !== null) {
                    onChange(response);
                }
                onClose();
            })
            .catch((err) => {
                setError(err);
            });
    }, [ids, endpoint, onChange, onClose, setError]);

    return (
        <>
            <Button
                {...props}
                className={classNames([
                    styles.container,
                    {
                        [className]: className !== null,
                    },
                ])}
                label={label}
                icon={icon}
                onClick={onOpen}
                disabled={disabled}
                theme={disabled ? 'secondary' : theme}
            />
            {modal !== null ? (
                <Confirm
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
                </Confirm>
            ) : null}
        </>
    );
};

DuplicateAction.propTypes = propTypes;
DuplicateAction.defaultProps = defaultProps;

export default DuplicateAction;
