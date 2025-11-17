/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import { useDisplaysComponentsManager } from '@panneau/core/contexts';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    value: PropTypes.any,
    display: PropTypes.string,
    className: PropTypes.string,
};

function DisplayField({
    value = null,
    display = null,
    className = null,
    ...props
}) {
    const displays = useDisplaysComponentsManager();
    const Component = displays.getComponent(display) || null;

    return value !== null && Component !== null ? (
        <Component
            className={classNames([
                {
                    [className]: className !== null,
                },
            ])}
            {...props}
            value={value}
        />
    ) : null;
}

DisplayField.propTypes = propTypes;

export default DisplayField;
