import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Switch from 'rc-switch';

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

const ToggleField = ({ value, name, className, onChange }) => (
    <div
        className={classNames([
            styles.container,
            {
                [className]: className !== null,
            },
        ])}
    >
        <Switch name={name} checked={value !== null ? value : false} onChange={onChange} />
    </div>
);

ToggleField.propTypes = propTypes;
ToggleField.defaultProps = defaultProps;

export default ToggleField;
