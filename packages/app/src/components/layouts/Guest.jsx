import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import MainNavbar from '../menus/MainNavbar';

const propTypes = {
    children: PropTypes.node.isRequired,
    fullscreen: PropTypes.bool,
};

const defaultProps = {
    fullscreen: false,
};

const GuestLayout = ({ fullscreen, children }) => (
    <div
        className={classNames({
            'd-flex flex-column min-vh-100': fullscreen,
        })}
    >
        <MainNavbar />
        <div
            className={classNames({
                'd-flex flex-column flex-grow-1': fullscreen,
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
GuestLayout.propTypes = propTypes;
GuestLayout.defaultProps = defaultProps;

export default GuestLayout;
