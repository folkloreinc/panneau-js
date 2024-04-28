/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import Button from '@panneau/element-button';

const propTypes = {
    theme: PropTypes.string,
    message: PropTypes.node,
    button: PropTypes.shape({}),
    delay: PropTypes.number,
    withDelay: PropTypes.bool,
    withoutCard: PropTypes.bool,
    className: PropTypes.string,
    children: PanneauPropTypes.label,
};

const defaultProps = {
    theme: null,
    message: null,
    button: null,
    delay: 300,
    withDelay: false,
    withoutCard: false,
    className: null,
    children: null,
};

const Empty = ({ theme, message, button, delay, withDelay, withoutCard, className, children }) => {
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
                {children !== null ? (
                    <div className={classNames(['mx-2', { [`text-${theme}`]: theme !== null }])}>
                        {children}
                    </div>
                ) : (
                    <div className={classNames([{ [`text-${theme}`]: theme !== null }])}>
                        {message || (
                            <FormattedMessage defaultMessage="Empty" description="Empty message" />
                        )}
                    </div>
                )}
            </div>
            {button !== null ? (
                <div className="card-footer d-flex align-items-center justify-content-center">
                    <Button {...button} />
                </div>
            ) : null}
        </div>
    ) : null;
};

Empty.propTypes = propTypes;
Empty.defaultProps = defaultProps;

export default Empty;
