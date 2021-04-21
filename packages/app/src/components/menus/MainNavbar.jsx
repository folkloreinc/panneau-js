/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
// import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { usePanneau, useUrlGenerator } from '@panneau/core/contexts';
import Navbar from '@panneau/element-navbar';

import { useUser } from '../../contexts/AuthContext';
import ResourcesMenu from './Resources';
import AccountMenu from './Account';

const propTypes = {};

const defaultProps = {};

const MainNavbar = (props) => {
    const { label } = usePanneau();
    const route = useUrlGenerator();
    const user = useUser();
    return (
        <Navbar {...props}>
            {label !== null ? (
                <Link to={route('home')} className="navbar-brand">
                    {label}
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
