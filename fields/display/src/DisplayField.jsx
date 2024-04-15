/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import { useDisplaysComponentsManager } from '@panneau/core/contexts';

import styles from './styles.module.scss';

const propTypes = {
    value: PropTypes.bool,
    display: PropTypes.string,
    className: PropTypes.string,
};

const defaultProps = {
    value: null,
    display: null,
    className: null,
};

const DisplayField = ({ value = null, display = null, className, ...props }) => {
    const displays = useDisplaysComponentsManager();
    const Component = displays.getComponent(display) || null;

    return value !== null && Component !== null ? (
        <Component
            className={classNames([
                styles.container,
                {
                    [className]: className !== null,
                },
            ])}
            {...props}
            value={value}
        />
    ) : null;
};

DisplayField.propTypes = propTypes;
DisplayField.defaultProps = defaultProps;

export default DisplayField;
