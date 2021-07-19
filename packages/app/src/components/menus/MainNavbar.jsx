/* eslint-disable react/jsx-props-no-spreading */
import { useUser } from '@panneau/auth';
import { usePanneau, usePanneauColorScheme, useUrlGenerator } from '@panneau/core/contexts';
import Navbar from '@panneau/element-navbar';
import React from 'react';
// import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import AccountMenu from './Account';
import ResourcesMenu from './Resources';

const propTypes = {};

const defaultProps = {};

const MainNavbar = (props) => {
    const { name } = usePanneau();
    const { background } = usePanneauColorScheme();
    const route = useUrlGenerator();
    const user = useUser();

    return (
        <Navbar theme={background} {...props}>
            {name !== null ? (
                <Link to={route('home')} className="navbar-brand">
                    {name}
                </Link>
            ) : null}
            {user !== null ? (
                <ResourcesMenu
                    className="navbar-nav ml-4"
                    itemClassName="nav-item"
                    linkClassName="nav-link"
                />
            ) : null}
            <AccountMenu
                className="navbar-nav ms-auto"
                itemClassName="nav-item"
                linkClassName="nav-link"
            />
        </Navbar>
    );
};
MainNavbar.propTypes = propTypes;
MainNavbar.defaultProps = defaultProps;

export default MainNavbar;
