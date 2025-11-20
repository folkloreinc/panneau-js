import classNames from 'classnames';
import { type ReactNode, useCallback, useState } from 'react';

import Button from '@panneau/element-button';
import Link from '@panneau/element-link';

interface NavbarProps {
    brand?: ReactNode | null;
    brandLink?: string | null;
    breadcrumbs?: ReactNode | null;
    theme?: 'light' | 'dark' | 'primary' | null;
    size?: 'sm' | 'md' | 'lg';
    compact?: boolean;
    noWrap?: boolean;
    withoutCollapse?: boolean;
    vertical?: boolean;
    children?: ReactNode | null;
    className?: string | null;
    collapseClassName?: string | null;
    brandClassName?: string | null;
    breadCrumbsClassName?: string | null;
}

function Navbar({
    brand = null,
    brandLink = null,
    breadcrumbs = null,
    theme = null,
    size = 'md',
    compact = false,
    noWrap = false,
    withoutCollapse = false,
    vertical = false,
    children = null,
    className = null,
    collapseClassName = null,
    brandClassName = null,
    breadCrumbsClassName = null,
}: NavbarProps) {
    const [menuVisible, setMenuVisible] = useState(false);
    const onClickMenu = useCallback(
        () => setMenuVisible(!menuVisible),
        [setMenuVisible, menuVisible],
    );
    return (
        <nav
            className={classNames([
                'navbar',
                {
                    [`bg-${theme}`]: theme !== null,
                    [`navbar-expand-${size}`]: !withoutCollapse,
                    [`navbar-${theme === 'light' ? 'light' : 'dark'}`]: theme !== null,
                    [`text-${theme === 'light' ? 'dark' : 'light'}`]: theme !== null,
                    'py-2': compact,
                    'px-2': compact,
                    'flex-nowrap': noWrap,
                    'flex-column align-items-stretch': vertical,
                    [className!]: className !== null,
                },
            ])}
        >
            {brand !== null && brandLink !== null ? (
                <Link
                    className={classNames([
                        'navbar-brand',
                        {
                            'py-0': compact,
                            [brandClassName!]: brandClassName !== null,
                        },
                    ])}
                    href={brandLink}
                >
                    {brand}
                </Link>
            ) : null}
            {brand !== null && brandLink === null ? (
                <span
                    className={classNames([
                        'navbar-brand',
                        {
                            'py-0': compact,
                            [brandClassName!]: brandClassName !== null,
                        },
                    ])}
                >
                    {brand}
                </span>
            ) : null}
            {breadcrumbs !== null ? (
                <span
                    className={classNames([
                        'navbar-breadcrumbs',
                        {
                            'py-0': compact,
                            [breadCrumbsClassName!]: breadCrumbsClassName !== null,
                        },
                    ])}
                >
                    {breadcrumbs}
                </span>
            ) : null}
            {!withoutCollapse ? (
                <Button
                    className="navbar-toggler"
                    onClick={onClickMenu}
                    withoutTheme
                    aria-controls="navbarSupportedContent"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon" />
                </Button>
            ) : null}
            {!withoutCollapse ? (
                <div
                    className={classNames([
                        'navbar-collapse',
                        'collapse',
                        {
                            show: menuVisible,
                            'd-flex': !menuVisible && vertical,
                            'flex-column': !menuVisible && vertical,
                            'align-items-stretch': !menuVisible && vertical,
                            'ps-2': !menuVisible && vertical,
                            [collapseClassName!]: collapseClassName !== null,
                        },
                    ])}
                >
                    {children}
                </div>
            ) : (
                children
            )}
        </nav>
    );
}

export default Navbar;
