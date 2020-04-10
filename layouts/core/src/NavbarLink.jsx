import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import isObject from 'lodash/isObject';
import isArray from 'lodash/isArray';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { PropTypes as PanneauPropTypes, withUrlGenerator } from '@panneau/core';

const propTypes = {
    urlGenerator: PanneauPropTypes.urlGenerator,
    link: PropTypes.string,
    linkRoute: PropTypes.string,
    label: PanneauPropTypes.label,
    external: PropTypes.bool,
    isDropdown: PropTypes.bool,
    hasDropdown: PropTypes.bool,
    className: PropTypes.string,
    onClick: PropTypes.func,
};

const defaultProps = {
    urlGenerator: null,
    link: null,
    linkRoute: null,
    label: null,
    external: false,
    isDropdown: false,
    hasDropdown: false,
    className: null,
    onClick: null,
};

const NavbarLink = ({
    urlGenerator,
    link,
    linkRoute,
    external,
    label,
    isDropdown,
    hasDropdown,
    className,
    onClick,
}) => {
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

    const finalLinkRoute = linkRoute !== null && urlGenerator
        ? urlGenerator.route(...(isArray(linkRoute) ? linkRoute : [linkRoute]))
        : null;
    const finalLink = link || finalLinkRoute || '#';

    return external ? (
        <a href={finalLink} className={linkClassNames} {...dropdownProps} onClick={onClick}>
            {inner}
        </a>
    ) : (
        <Link
            to={{
                pathname: finalLink,
            }}
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

export default withUrlGenerator()(NavbarLink);
