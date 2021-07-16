import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Switch from 'rc-switch';

import styles from './styles.module.scss';

const propTypes = {
    param: PropTypes.string,
    value: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
};

const defaultProps = {
    param: 'q',
    className: null,
};

const ToggleFilter = ({ param, value, onChange, className }) => {
    const [toggleValue, setToggleValue] = useState(value !== null);
    const onToggleChange = useCallback( option => {
        console.log('toggle:', option); /* eslint-disable-line */
        onChange(option);
        // FIXME
        setToggleValue(!toggleValue);
    });

    return (
        <div className={classNames([
            styles.container,
            {
                [className]: className !== null,
            },
        ])}>
            <Switch name={param} checked={toggleValue} onChange={onToggleChange} />
        </div>
    );
};

ToggleFilter.propTypes = propTypes;
ToggleFilter.defaultProps = defaultProps;

export default ToggleFilter;
