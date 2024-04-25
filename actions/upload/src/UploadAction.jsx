/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import isArray from 'lodash/isArray';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import Button from '@panneau/element-button';

import styles from './styles.module.scss';

// TODO: fix this

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
    onChange: PropTypes.func,
    onConfirmed: PropTypes.func,
    withConfirmation: PropTypes.bool,
    className: PropTypes.string,
};

const defaultProps = {
    title: null,
    description: null,
    fields: null,
    endpoint: null,
    label: <FormattedMessage defaultMessage="Add a file" description="Button label" />,
    icon: 'upload',
    value: null,
    theme: 'primary',
    disabled: false,
    onChange: null,
    onConfirmed: null,
    withConfirmation: false,
    className: null,
};

const UploadAction = ({
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
    withConfirmation,
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
            if (onConfirmed !== null) {
                onConfirmed(newValue);
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

    const ids = useMemo(() => {
        if (value == null) {
            return null;
        }
        if (isArray(value)) {
            return value.map(({ id = null } = {}) => id).filter((id) => id !== null);
        }
        return value !== null ? [value?.id] : null;
    }, [value]);

    const idLabels = useMemo(() => (ids || []).map((id) => `#${id}`).join(', '), [ids]);
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
            {showModal ? 'Something' : null}
        </>
    );
};

UploadAction.propTypes = propTypes;
UploadAction.defaultProps = defaultProps;

export default UploadAction;
