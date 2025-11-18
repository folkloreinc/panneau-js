import PropTypes from 'prop-types';
import React, { useCallback, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

import { useLogout, useUser } from '@panneau/auth';
import { useUrlGenerator } from '@panneau/core/contexts';
import Menu from '@panneau/element-menu';

const propTypes = {
    withAccountForm: PropTypes.bool,
    className: PropTypes.string,
    itemClassName: PropTypes.string,
    linkClassName: PropTypes.string,
};

function AccountMenu({
    withAccountForm = false,
    className = null,
    itemClassName = null,
    linkClassName = null
}) {
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
                              ...(withAccountForm
                                  ? [
                                        {
                                            label: (
                                                <FormattedMessage
                                                    defaultMessage="Update account"
                                                    description="Menu label"
                                                />
                                            ),
                                            href: route('account'),
                                        },
                                    ]
                                  : []),
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
                          href: route('auth.login'),
                      },
                  ],
        [user, route, onClickLogout, withAccountForm],
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
}
AccountMenu.propTypes = propTypes;

export default AccountMenu;
