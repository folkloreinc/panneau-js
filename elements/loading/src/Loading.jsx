import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { PropTypes as PanneauPropTypes } from '@panneau/core';

const propTypes = {
    theme: PropTypes.string,
    delay: PropTypes.number,
    withDelay: PropTypes.bool,
    withoutCard: PropTypes.bool,
    className: PropTypes.string,
    children: PanneauPropTypes.label,
};

const defaultProps = {
    theme: null,
    delay: 300,
    withDelay: false,
    withoutCard: false,
    className: null,
    children: null,
};

const Loading = ({ theme, delay, withDelay, withoutCard, className, children }) => {
    const [visible, setVisible] = useState(!withDelay);

    useEffect(() => {
        const id = setTimeout(() => {
            setVisible(true);
        }, delay);
        return () => {
            clearTimeout(id);
        };
    }, [setVisible]);

    return visible ? (
        <div
            className={classNames([
                {
                    card: !withoutCard,
                    [className]: className !== null,
                },
            ])}
        >
            <div className="card-body d-flex align-items-center justify-content-center text-muted">
                <div
                    className={classNames([
                        'spinner-border',
                        { [`text-${theme}`]: theme !== null },
                    ])}
                >
                    <span className="visually-hidden">
                        <FormattedMessage defaultMessage="Loading" description="Loading message" />
                    </span>
                </div>
                {children !== null ? (
                    <div className={classNames(['mx-2', { [`text-${theme}`]: theme !== null }])}>
                        {children}
                    </div>
                ) : null}
            </div>
        </div>
    ) : null;
};

Loading.propTypes = propTypes;
Loading.defaultProps = defaultProps;

export default Loading;
