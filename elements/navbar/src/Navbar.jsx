/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';

import Button from '@panneau/element-button';
import Link from '@panneau/element-link';

const propTypes = {
    brand: PropTypes.node,
    brandLink: PropTypes.string,
    breadcrumbs: PropTypes.node,
    theme: PropTypes.oneOf(['light', 'dark', 'primary', null]),
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    compact: PropTypes.bool,
    noWrap: PropTypes.bool,
    withoutCollapse: PropTypes.bool,
    children: PropTypes.node,
    className: PropTypes.string,
    collapseClassName: PropTypes.string,
    brandClassName: PropTypes.string,
    breadCrumbsClassName: PropTypes.string,
};

const defaultProps = {
    brand: null,
    brandLink: null,
    breadcrumbs: null,
    theme: null,
    size: 'md',
    compact: false,
    noWrap: false,
    withoutCollapse: false,
    children: null,
    className: null,
    collapseClassName: null,
    brandClassName: null,
    breadCrumbsClassName: null,
};

const Navbar = ({
    brand,
    brandLink,
    breadcrumbs,
    theme,
    size,
    compact,
    noWrap,
    withoutCollapse,
    children,
    className,
    collapseClassName,
    brandClassName,
    breadCrumbsClassName,
}) => {
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
                    [className]: className !== null,
                },
            ])}
        >
            {brand !== null && brandLink !== null ? (
                <Link
                    className={classNames([
                        'navbar-brand',
                        {
                            'py-0': compact,
                            [brandClassName]: brandClassName !== null,
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
                            [brandClassName]: brandClassName !== null,
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
                            [breadCrumbsClassName]: breadCrumbsClassName !== null,
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
                            [collapseClassName]: collapseClassName !== null,
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
};

Navbar.propTypes = propTypes;
Navbar.defaultProps = defaultProps;

export default Navbar;
