import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

import { useUrlGenerator } from '@panneau/core/contexts';
import Menu from '@panneau/element-menu';

import { useUser, useLogout } from '../../contexts/AuthContext';

import messages from '../messages';

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
                          href: route('auth.account'),
                          dropdown: [
                              {
                                  label: messages.updateAccount,
                                  href: route('auth.account'),
                              },
                              {
                                  label: messages.logout,
                                  href: route('auth.logout'),
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
    return items !== null ? (
        <Menu
            className={className}
            itemClassName={itemClassName}
            linkClassName={linkClassName}
            items={items}
            dropdownAlign="end"
        />
    ) : null;
};
AccountMenu.propTypes = propTypes;
AccountMenu.defaultProps = defaultProps;

export default AccountMenu;
