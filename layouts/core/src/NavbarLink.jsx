import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import isObject from 'lodash/isObject';
import isArray from 'lodash/isArray';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useUrlGenerator } from '@panneau/core/contexts';

const propTypes = {
    href: PropTypes.string,
    route: PropTypes.string,
    label: PanneauPropTypes.label,
    external: PropTypes.bool,
    isDropdown: PropTypes.bool,
    hasDropdown: PropTypes.bool,
    className: PropTypes.string,
    onClick: PropTypes.func,
};

const defaultProps = {
    href: null,
    route: null,
    label: null,
    external: false,
    isDropdown: false,
    hasDropdown: false,
    className: null,
    onClick: null,
};

const NavbarLink = ({
    href,
    route,
    external,
    label,
    isDropdown,
    hasDropdown,
    className,
    onClick,
}) => {
    const urlGenerator = useUrlGenerator();
    const inner = (
        <Fragment>
            {isObject(label) && typeof label.id !== 'undefined' ? (
                <FormattedMessage {...label || null} />
            ) : (
                label || ''
            )}
            {hasDropdown ? ' ' : null}
            {hasDropdown ? <span className="caret" /> : null}
        </Fragment>
    );

    const linkClassNames = classNames({
        'nav-link': !isDropdown,
        'dropdown-item': isDropdown,
        'dropdown-toggle': hasDropdown,
        [className]: className !== null,
    });

    const dropdownProps = hasDropdown
        ? {
            role: 'button',
            'data-toggle': 'dropdown',
            'aria-haspopup': 'true',
            'aria-expanded': 'false',
        }
        : null;

    const finalRoute = route !== null
        ? urlGenerator.route(...(isArray(route) ? route : [route]))
        : null;
    const finalHref = href || finalRoute || '#';

    return external ? (
        <a href={finalHref} className={linkClassNames} {...dropdownProps} onClick={onClick}>
            {inner}
        </a>
    ) : (
        <Link
            to={finalHref}
            className={linkClassNames}
            {...dropdownProps}
            onClick={onClick}
        >
            {inner}
        </Link>
    );
};

NavbarLink.propTypes = propTypes;
NavbarLink.defaultProps = defaultProps;

export default NavbarLink;
