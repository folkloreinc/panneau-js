/* eslint-disable react/jsx-props-no-spreading */
import isArray from 'lodash/isArray';
import React, { useMemo } from 'react';
// import PropTypes from 'prop-types';
import Link from '@panneau/element-link';

import { useUser } from '@panneau/auth';
import { usePanneau, usePanneauColorScheme, useUrlGenerator } from '@panneau/core/contexts';
import Menu from '@panneau/element-menu';
import Navbar from '@panneau/element-navbar';

import AccountMenu from './Account';
import ResourcesMenu from './Resources';

const propTypes = {};

const defaultProps = {};

const MainNavbar = (props) => {
    const { name, menus = null } = usePanneau();
    const { main = null, guest = null } = menus || {};
    const { background } = usePanneauColorScheme();
    const route = useUrlGenerator();
    const user = useUser();

    const items = useMemo(() => {
        const menuItems = (user !== null ? main : guest) || [];
        const hasResources = menuItems.indexOf('resources') !== -1;
        const hasAccount = menuItems.indexOf('account') !== -1;
        return [
            !hasResources && user !== null ? 'resources' : null,
            ...menuItems,
            !hasAccount && menuItems.indexOf('separator') === -1 ? 'separator' : null,
            !hasAccount ? 'account' : null,
        ]
            .filter((it) => it !== null)
            .reduce((currentItems, item, index) => {
                if (item === 'resources') {
                    return [
                        ...currentItems,
                        <ResourcesMenu
                            key={`menu-item-resource-${index + 1}`}
                            className="navbar-nav"
                            itemClassName="nav-item"
                            linkClassName="nav-link"
                        />,
                    ];
                }
                if (item === 'account') {
                    return [
                        ...currentItems,
                        <AccountMenu
                            key={`menu-item-account-${index + 1}`}
                            className="navbar-nav"
                            itemClassName="nav-item"
                            linkClassName="nav-link"
                        />,
                    ];
                }
                if (item === 'separator') {
                    return [
                        ...currentItems,
                        <span key={`menu-item-spacer-${index + 1}`} className="ms-auto" />,
                    ];
                }
                const lastItem =
                    currentItems.length > 0 ? currentItems[currentItems.length - 1] : null;

                return isArray(lastItem)
                    ? [...currentItems.slice(0, currentItems.length - 1), [...lastItem, item]]
                    : [...currentItems, [item]];
            }, [])
            .map((it, index) =>
                isArray(it) ? (
                    <Menu
                        items={it}
                        key={`submenu-item-${index + 1}`}
                        className="navbar-nav"
                        itemClassName="nav-item"
                        linkClassName="nav-link"
                    />
                ) : (
                    it
                ),
            );
    }, [main]);

    return (
        <Navbar theme={background} {...props}>
            {name !== null ? (
                <Link href={route('home')} className="navbar-brand">
                    {name}
                </Link>
            ) : null}
            {items}
        </Navbar>
    );
};
MainNavbar.propTypes = propTypes;
MainNavbar.defaultProps = defaultProps;

export default MainNavbar;
