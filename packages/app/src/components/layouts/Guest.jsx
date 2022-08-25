import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import { usePanneauColorScheme } from '@panneau/core/contexts';

import MainNavbar from '../menus/MainNavbar';

const propTypes = {
    children: PropTypes.node.isRequired,
    fullscreen: PropTypes.bool,
};

const defaultProps = {
    fullscreen: false,
};

const GuestLayout = ({ fullscreen, children }) => {
    const { background, text } = usePanneauColorScheme();
    return (
        <div
            className={classNames({
                'd-flex flex-column min-vh-100': fullscreen,
            })}
        >
            <MainNavbar className={classNames(['sticky-top', 'px-3'])} />
            <div
                className={classNames({
                    'd-flex flex-column flex-grow-1': fullscreen,
                    [`bg-${background}`]: background !== null,
                    [`text-${text}`]: text !== null,
                })}
            >
                <div
                    className={classNames({
                        'w-100 my-auto': fullscreen,
                    })}
                >
                    {children}
                </div>
            </div>
        </div>
    );
};

GuestLayout.propTypes = propTypes;
GuestLayout.defaultProps = defaultProps;

export default GuestLayout;
