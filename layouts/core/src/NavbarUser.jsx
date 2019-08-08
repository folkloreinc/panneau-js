/* eslint-disable react/no-array-index-key */
import React from 'react';
import PropTypes from 'prop-types';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { defineMessages } from 'react-intl';

import NavbarItem from './NavbarItem';

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
    label: PanneauPropTypes.label,
    items: PropTypes.arrayOf(
        PropTypes.shape({
            type: PropTypes.string,
            label: PanneauPropTypes.label,
        }),
    ),
};

const defaultProps = {
    label: messages.label,
    items: [
        {
            label: messages.myAccount,
            route: 'account',
        },
        {
            type: 'divider',
        },
        {
            label: messages.logout,
            route: 'auth.logout',
            external: true,
        },
    ],
};

const NavbarUser = props => <NavbarItem {...props} />;

NavbarUser.propTypes = propTypes;
NavbarUser.defaultProps = defaultProps;

export default NavbarUser;
