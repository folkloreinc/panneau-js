import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { defineMessages } from 'react-intl';

import { useUrlGenerator } from '@panneau/core/contexts';
import { useUser, useLogout } from '../../contexts/AuthContext';

import Menu from './Menu';

const messages = defineMessages({
    login: {
        id: 'login',
        defaultMessage: 'Login',
    },
    logout: {
        id: 'logout',
        defaultMessage: 'Logout',
    },
    account: {
        id: 'account',
        defaultMessage: 'Account',
    },
    updateAccount: {
        id: 'update_account',
        defaultMessage: 'Update account',
    },
});

const propTypes = {
    className: PropTypes.string,
    itemClassName: PropTypes.string,
    linkClassName: PropTypes.string,
};

const defaultProps = {
    className: null,
    itemClassName: null,
    linkClassName: null,
};

const AccountMenu = ({ className, itemClassName, linkClassName }) => {
    const route = useUrlGenerator();
    const user = useUser();
    const logout = useLogout();
    const onClickLogout = useCallback(
        (e) => {
            e.preventDefault();
            logout();
        },
        [logout],
    );
    const items = useMemo(
        () =>
            user !== null
                ? [
                      {
                          id: 'account',
                          label: messages.account,
                          href: route('account'),
                          dropdown: [
                              {
                                  label: messages.updateAccount,
                                  href: route('account'),
                              },
                              {
                                  label: messages.logout,
                                  href: route('logout'),
                                  onClick: onClickLogout,
                              },
                          ],
                      },
                  ]
                : [
                      {
                          label: messages.login,
                          href: route('login'),
                      },
                  ],
        [user, route, onClickLogout],
    );
    return (
        <Menu
            className={className}
            itemClassName={itemClassName}
            linkClassName={linkClassName}
            items={items}
            dropdownAlign="right"
        />
    );
};
AccountMenu.propTypes = propTypes;
AccountMenu.defaultProps = defaultProps;

export default AccountMenu;
