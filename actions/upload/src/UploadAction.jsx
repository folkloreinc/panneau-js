/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import UploadField from '@panneau/field-upload';

import styles from './styles.module.scss';

// TODO: fix this

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
    withConfirmation,
    className,
    ...props
}) => {
    // const { ids, idLabels, modalKey } = useActionProps(value);
    console.log('upload action...');
    return (
        <UploadField
            className={classNames([
                styles.container,
                {
                    [className]: className !== null,
                },
            ])}
            label={label}
            icon={icon}
            disabled={disabled}
            theme={disabled ? 'secondary' : theme}
            {...props}
        />
    );
};

UploadAction.propTypes = propTypes;
UploadAction.defaultProps = defaultProps;

export default UploadAction;
