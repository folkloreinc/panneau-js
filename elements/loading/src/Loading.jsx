import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import Label from '@panneau/element-label';

const propTypes = {
    children: PanneauPropTypes.label,
    className: PropTypes.string,
};

const defaultProps = {
    children: null,
    className: null,
};

const Loading = ({ children, className }) => (
    <div
        className={classNames([
            'card',
            {
                [className]: className !== null,
            },
        ])}
    >
        <div className="card-body d-flex align-items-center justify-content-center text-muted">
            <FontAwesomeIcon icon={faSpinner} className="d-block fa-spin me-2" />
            <div>
                <Label>{children}</Label>
            </div>
        </div>
    </div>
);
Loading.propTypes = propTypes;
Loading.defaultProps = defaultProps;

export default Loading;
