/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import Button from '@panneau/element-button';
import FormModal from '@panneau/modal-form';

import styles from './styles.module.scss';

const propTypes = {
    title: PropTypes.node,
    description: PropTypes.node,
    fields: PropTypes.arrayOf(PropTypes.shape({})),
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
    fields: null,
    endpoint: null,
    label: <FormattedMessage defaultMessage="Edit" description="Button label" />,
    icon: 'pencil',
    value: false,
    theme: 'primary',
    disabled: false,
    setSelectedItems: null,
    className: null,
};

const EditAction = ({
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
    setSelectedItems,
    className,
    ...props
}) => {
    const [showModal, setShowModal] = useState(false);

    const onOpen = useCallback(() => {
        setShowModal(true);
    }, [setShowModal]);

    const onComplete = useCallback(
        (newValue) => {
            setShowModal(false);
            if (setSelectedItems !== null) {
                setSelectedItems([]);
            }
            if (onChange !== null) {
                onChange(newValue);
            }
        },
        [onChange, setShowModal],
    );

    const onClose = useCallback(() => {
        setShowModal(false);
    }, [setShowModal]);

    const ids = useMemo(
        () => (value || []).map(({ id = null } = {}) => id).filter((id) => id !== null),
        [value],
    );
    const idLabels = useMemo(() => (ids || []).map((id) => `#${id}`).join(', '), [ids]);

    const multipleValues = useMemo(() => value !== null && value.length > 1, [value]);

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
                <FormModal
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
                </FormModal>
            ) : null}
        </div>
    );
};

EditAction.propTypes = propTypes;
EditAction.defaultProps = defaultProps;

export default EditAction;
