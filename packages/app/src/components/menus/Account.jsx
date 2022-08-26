import PropTypes from 'prop-types';
import React, { useCallback, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

import { useLogout, useUser } from '@panneau/auth';
import { useUrlGenerator } from '@panneau/core/contexts';
import Menu from '@panneau/element-menu';

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
        [logout, route],
    );

    const items = useMemo(
        () =>
            user !== null
                ? [
                      {
                          id: 'account',
                          label: (
                              <FormattedMessage defaultMessage="Account" description="Menu label" />
                          ),
                          href: route('account'),
                          dropdown: [
                              //   {
                              //       label: (
                              //           <FormattedMessage
                              //               defaultMessage="Update account"
                              //               description="Menu label"
                              //           />
                              //       ),
                              //       href: route('panneau.account'),
                              //   },
                              {
                                  label: (
                                      <FormattedMessage
                                          defaultMessage="Logout"
                                          description="Menu label"
                                      />
                                  ),
                                  href: route('auth.logout'),
                                  onClick: onClickLogout,
                              },
                          ],
                      },
                  ]
                : [
                      {
                          label: (
                              <FormattedMessage defaultMessage="Login" description="Menu label" />
                          ),
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
