/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { useModal } from '@panneau/core/contexts';
import { useActionProps } from '@panneau/core/hooks';
import Button from '@panneau/element-button';
import FormModal from '@panneau/modal-form';

import styles from './styles.module.scss';

const propTypes = {
    id: PropTypes.string.isRequired,
    title: PropTypes.node,
    description: PropTypes.node,
    fields: PropTypes.arrayOf(PropTypes.shape({})),
    endpoint: PropTypes.string,
    label: PropTypes.string,
    value: PropTypes.bool,
    icon: PropTypes.string,
    theme: PropTypes.string,
    disabled: PropTypes.bool,
    onChange: PropTypes.func,
    onConfirmed: PropTypes.func,
    valueLabelPath: PropTypes.string,
    withConfirmation: PropTypes.bool,
    className: PropTypes.string,
};

const defaultProps = {
    title: null,
    description: null,
    fields: null,
    endpoint: null,
    label: <FormattedMessage defaultMessage="Edit" description="Button label" />,
    icon: 'pencil',
    value: null,
    theme: 'primary',
    disabled: false,
    onChange: null,
    onConfirmed: null,
    valueLabelPath: null,
    withConfirmation: false,
    className: null,
};

const EditAction = ({
    id,
    title,
    description,
    fields,
    endpoint,
    label,
    icon,
    value,
    theme,
    disabled,
    onChange,
    onConfirmed,
    valueLabelPath,
    withConfirmation,
    className,
    ...props
}) => {
    const { modals = null, register = null, unregister = null } = useModal();

    const [error, setError] = useState(null);

    const { ids, idLabels, modalKey } = useActionProps(id, value, valueLabelPath);

    const modal = useMemo(
        () => (modals || []).find(({ id: modalId = null }) => modalId === `${modalKey}`) || null,
        [modals, modalKey],
    );

    const onOpen = useCallback(() => {
        register(modalKey);
    }, [modalKey, register]);

    const onClose = useCallback(() => {
        unregister(modalKey);
    }, [modalKey, unregister]);

    const onComplete = useCallback(
        (newValue) => {
            unregister(modalKey);
            if (onConfirmed !== null) {
                onConfirmed(newValue);
            }
            if (onChange !== null) {
                onChange(newValue);
            }
        },
        [onChange, unregister, modalKey],
    );

    const onError = useCallback(() => {
        setError(true);
    }, [setError]);

    const multipleValues = useMemo(() => value !== null && value.length > 1, [value]);

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
                onClick={withConfirmation ? onOpen : null}
                disabled={disabled}
                theme={disabled ? 'secondary' : theme}
                {...props}
            />
            {modal !== null ? (
                <FormModal
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
                </FormModal>
            ) : null}
        </>
    );
};

EditAction.propTypes = propTypes;
EditAction.defaultProps = defaultProps;

export default EditAction;
