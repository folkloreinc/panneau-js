/* eslint-disable react/jsx-props-no-spreading */
import { getCSRFHeaders, postJSON } from '@folklore/fetch';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';

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
    endpoint: '/batch',
    label: <FormattedMessage defaultMessage="Delete" description="Button label" />,
    icon: 'trash',
    value: false,
    theme: 'primary',
    disabled: false,
    setSelectedItems: null,
    className: null,
};

const DeleteAction = ({
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
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState(null);

    const ids = useMemo(
        () => (value || []).map(({ id = null } = {}) => id).filter((id) => id !== null),
        [value],
    );
    const idLabels = useMemo(() => (ids || []).map((id) => `#${id}`).join(', '), [ids]);

    const onOpen = useCallback(() => {
        setShowModal(true);
    }, [setShowModal]);

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
                setShowModal(false);
                if (setSelectedItems !== null) {
                    setSelectedItems([]);
                }
                if (onChange !== null) {
                    onChange(response);
                }
            })
            .catch((err) => {
                // console.log(err);
                setError(err);
            });
    }, [ids, endpoint, onChange, setShowModal, setError]);

    const onClose = useCallback(() => {
        setShowModal(false);
    }, [setShowModal]);

    return (
        <div
            className={classNames([
                styles.container,
                {
                    [className]: className !== null,
                },
            ])}
        >
            <Button
                {...props}
                label={label}
                icon={icon}
                onClick={onOpen}
                disabled={disabled}
                theme={disabled ? 'secondary' : theme}
            />
            {showModal ? (
                <Confirm
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
                </Confirm>
            ) : null}
        </div>
    );
};

DeleteAction.propTypes = propTypes;
DeleteAction.defaultProps = defaultProps;

export default DeleteAction;
