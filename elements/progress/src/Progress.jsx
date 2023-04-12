/* eslint-disable jsx-a11y/control-has-associated-label */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

// import { PropTypes as PanneauPropTypes } from '@panneau/core';

// import Label from '@panneau/element-label';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: null,
};

const Progress = ({ className }) => (
    <div
        className={classNames([
            'progress',
            {
                [className]: className !== null,
            },
        ])}
    >
        <div
            className="progress-bar"
            role="progressbar"
            style={{ width: '15%' }}
            aria-valuenow="15"
            aria-valuemin="0"
            aria-valuemax="100"
        />
        <div
            className="progress-bar bg-success"
            role="progressbar"
            style={{ width: '30%' }}
            aria-valuenow="30"
            aria-valuemin="0"
            aria-valuemax="100"
        />
        <div
            className="progress-bar bg-info"
            role="progressbar"
            style={{ width: '20%' }}
            aria-valuenow="20"
            aria-valuemin="0"
            aria-valuemax="100"
        />
    </div>
);
Progress.propTypes = propTypes;
Progress.defaultProps = defaultProps;

export default Progress;
