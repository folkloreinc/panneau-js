import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import { usePanneauColorScheme } from '@panneau/core/contexts';

import MainNavbar from '../menus/MainNavbar';

import styles from '../../styles/layouts/guest.module.scss';

const propTypes = {
    children: PropTypes.node.isRequired,
    fullscreen: PropTypes.bool,
};

const defaultProps = {
    fullscreen: false,
};

const GuestLayout = ({ fullscreen, children }) => {
    const { theme = null, background = null, text = null } = usePanneauColorScheme();
    return (
        <div
            className={classNames([
                styles.container,
                {
                    'd-flex flex-column min-vh-100': fullscreen,
                },
            ])}
            data-bs-theme={theme !== null ? theme : null}
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
