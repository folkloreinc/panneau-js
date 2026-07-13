import classNames from 'classnames';
import { type ReactNode, useState } from 'react';

import { BreakpointsSize } from '@panneau/core';
import Button from '@panneau/element-button';
import Link from '@panneau/element-link';

interface NavbarProps {
    brand?: ReactNode | null;
    brandLink?: string | null;
    breadcrumbs?: ReactNode | null;
    theme?: 'light' | 'dark' | 'primary' | null;
    size?: BreakpointsSize;
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
    const onClickMenu = () => setMenuVisible(!menuVisible);
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
                },
                className,
            ])}
        >
            {brand !== null && brandLink !== null ? (
                <Link
                    className={classNames([
                        'navbar-brand',
                        {
                            'py-0': compact,
                        },
                        brandClassName,
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
                        },
                        brandClassName,
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
                        },
                        breadCrumbsClassName,
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
                        },
                        collapseClassName,
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
