import classNames from 'classnames';
import PropTypes from 'prop-types';
import Switch from 'rc-switch';
import React from 'react';
import styles from './styles.module.scss';

const propTypes = {
    value: PropTypes.bool,
    name: PropTypes.string,
    className: PropTypes.string,
    onChange: PropTypes.func,
};

const defaultProps = {
    value: null,
    name: null,
    className: null,
    onChange: null,
};

const ToggleField = ({ value, name, className, onChange }) => {
    const isTrue = value === true || value === 'true' || value === 1 || value === '1';
    return (
        <div
            className={classNames([
                styles.container,
                {
                    [className]: className !== null,
                },
            ])}
        >
            <Switch name={name} checked={isTrue} onChange={onChange} />
        </div>
    );
};

ToggleField.propTypes = propTypes;
ToggleField.defaultProps = defaultProps;

export default ToggleField;
