/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import Switch from 'rc-switch';
import React from 'react';
import styles from './styles.module.scss';

const propTypes = {
    name: PropTypes.string,
    value: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
};

const defaultProps = {
    name: 'toggle',
    value: false,
    className: null,
};

const ToggleFilter = ({ name, value, onChange, className, ...props }) => {
    const isTrue =
        value !== null && (value === true || value === 'true' || value === 1 || value === '1');
    return (
        <div
            className={classNames([
                styles.container,
                {
                    [className]: className !== null,
                },
            ])}
        >
            <Switch {...props} name={name} checked={isTrue} onChange={onChange} />
        </div>
    );
};

ToggleFilter.propTypes = propTypes;
ToggleFilter.defaultProps = defaultProps;

export default ToggleFilter;
