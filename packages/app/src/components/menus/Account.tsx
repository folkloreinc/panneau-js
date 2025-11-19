import React, { useCallback, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

import { useLogout, useUser } from '@panneau/auth';
import { useUrlGenerator } from '@panneau/core/contexts';
import Menu from '@panneau/element-menu';

interface AccountMenuProps {
    withAccountForm?: boolean;
    className?: string | null;
    itemClassName?: string | null;
    linkClassName?: string | null;
}

function AccountMenu({
    withAccountForm = false,
    className = null,
    itemClassName = null,
    linkClassName = null,
}: AccountMenuProps) {
    const route = useUrlGenerator();
    const user = useUser();
    const logout = useLogout();

    const onClickLogout = useCallback(
        (e: React.MouseEvent) => {
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

export default AccountMenu;
