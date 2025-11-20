import { type ReactNode } from 'react';
import classNames from 'classnames';

import { usePanneauColorScheme } from '@panneau/core/contexts';

import MainNavbar from '../menus/MainNavbar';

interface GuestLayoutProps {
    children: ReactNode;
    fullscreen?: boolean;
}

function GuestLayout({ fullscreen = false, children }: GuestLayoutProps) {
    const { theme = null, background = null, text = null } = usePanneauColorScheme();
    return (
        <div
            className={classNames([
                {
                    'd-flex flex-column min-vh-100': fullscreen,
                },
            ])}
            data-bs-theme={theme !== null ? theme : undefined}
        >
            <MainNavbar className={classNames(['sticky-top', 'px-3'])} />
            <div
                className={classNames({
                    'd-flex flex-column flex-grow-1': fullscreen,
                    [`bg-${background}`]: background !== null,
                    [`text-${text}`]: text !== null,
                })}
            >
                <div
                    className={classNames({
                        'w-100 my-auto': fullscreen,
                    })}
                >
                    {children}
                </div>
            </div>
        </div>
    );
}

export default GuestLayout;
