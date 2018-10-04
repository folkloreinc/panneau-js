/* eslint-disable react/no-array-index-key */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import get from 'lodash/get';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { defineMessages } from 'react-intl';

import NavbarLink from './NavbarLink';
import NavbarDivider from './NavbarDivider';

const messages = defineMessages({
    label: {
        id: 'layouts.navbar.user.label',
        description: 'The label of the "user" navbar item',
        defaultMessage: 'Account',
    },
    myAccount: {
        id: 'layouts.navbar.user.account',
        description: 'The label of the "My account" navbar item',
        defaultMessage: 'My account',
    },
    logout: {
        id: 'layouts.navbar.user.logout',
        description: 'The label of the "logout" navbar item',
        defaultMessage: 'Logout',
    },
});

const propTypes = {
    link: PropTypes.string,
    label: PanneauPropTypes.label,
    items: PropTypes.arrayOf(PropTypes.shape({
        type: PropTypes.string,
        label: PanneauPropTypes.label,
    })),
    className: PropTypes.string,
    onClick: PropTypes.func,
    onClickItem: PropTypes.func,
};

const defaultProps = {
    link: null,
    label: messages.label,
    items: [
        {
            label: messages.myAccount,
            linkRoute: 'account',
        },
        {
            type: 'divider',
        },
        {
            label: messages.logout,
            linkRoute: 'auth.logout',
            external: true,
        },
    ],
    className: null,
    onClick: null,
    onClickItem: null,
};

const NavbarUser = ({
    link, label, items, className, onClick, onClickItem,
}) => {
    const finalItems = (items || []);
    const hasDropdown = finalItems.length > 0;
    return (
        <li
            className={classNames({
                'nav-item': true,
                dropdown: hasDropdown,
                [className]: className !== null,
            })}
        >
            <NavbarLink link={link} label={label} hasDropdown={hasDropdown} onClick={onClick} />
            {hasDropdown ? (
                <div className="dropdown-menu">
                    {items.map(
                        (it, index) => (get(it, 'type', 'item') === 'divider' ? (
                            <NavbarDivider key={`item-${index}`} isDropdown />
                        ) : (
                            <NavbarLink
                                key={`item-${index}`}
                                {...it}
                                isDropdown
                                onClick={(e) => {
                                    if (onClickItem !== null) {
                                        onClickItem(e, it, index);
                                    }
                                }}
                            />
                        )),
                    )}
                </div>
            ) : null}
        </li>
    );
};

NavbarUser.propTypes = propTypes;
NavbarUser.defaultProps = defaultProps;

export default NavbarUser;
