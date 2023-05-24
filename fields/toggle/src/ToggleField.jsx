import classNames from 'classnames';
import PropTypes from 'prop-types';
import Switch from 'rc-switch';
import React from 'react';

import styles from './styles.module.scss';

import 'rc-switch/assets/index.css';

const propTypes = {
    value: PropTypes.bool,
    name: PropTypes.string,
    disabled: PropTypes.bool,
    className: PropTypes.string,
    onChange: PropTypes.func,
};

const defaultProps = {
    value: null,
    name: null,
    disabled: false,
    className: null,
    onChange: null,
};

const ToggleField = ({ value, name, disabled, className, onChange }) => {
    const isTrue = value === true || value === 'true' || value === 1 || value === '1';
    return (
        <div
            className={classNames([
                styles.container,
                {
                    disabled,
                    [className]: className !== null,
                },
            ])}
        >
            <Switch name={name} checked={isTrue} onChange={onChange} disabled={disabled} />
        </div>
    );
};

ToggleField.propTypes = propTypes;
ToggleField.defaultProps = defaultProps;

export default ToggleField;
