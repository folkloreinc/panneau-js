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

const MainLayout = ({ children, fullscreen }) => (
    <div
        className={classNames({
            'd-flex flex-column min-vh-100': fullscreen,
        })}
    >
        <MainNavbar className="border-bottom sticky-top bg-light px-3" />
        <div
            className={classNames({
                'd-flex flex-column flex-grow-1': fullscreen,
            })}
        >
            {children}
        </div>
    </div>
);
MainLayout.propTypes = propTypes;
MainLayout.defaultProps = defaultProps;

export default MainLayout;
