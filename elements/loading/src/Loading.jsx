import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import { PropTypes as PanneauPropTypes } from '@panneau/core';

const propTypes = {
    theme: PropTypes.string,
    withoutCard: PropTypes.bool,
    children: PanneauPropTypes.label,
    className: PropTypes.string,
};

const defaultProps = {
    theme: null,
    withoutCard: false,
    children: null,
    className: null,
};

const Loading = ({ theme, withoutCard, children, className }) => (
    <div
        className={classNames([
            {
                'card': !withoutCard,
                [className]: className !== null,
            },
        ])}
    >
        <div className="card-body d-flex align-items-center justify-content-center text-muted">
            <div className={classNames(['spinner-border', { [`text-${theme}`]: theme !== null }])}>
                <span className="visually-hidden">
                    <FormattedMessage defaultMessage="Loading" />
                </span>
            </div>
            {children !== null ? (
                <div className={classNames(['mx-2', { [`text-${theme}`]: theme !== null }])}>
                    {children}
                </div>
            ) : null}
        </div>
    </div>
);
Loading.propTypes = propTypes;
Loading.defaultProps = defaultProps;

export default Loading;
