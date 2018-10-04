/* eslint-disable react/no-array-index-key */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import get from 'lodash/get';
import { PropTypes as PanneauPropTypes } from '@panneau/core';

import NavbarLink from './NavbarLink';
import NavbarDivider from './NavbarDivider';

const propTypes = {
    link: PropTypes.string,
    label: PanneauPropTypes.label,
    items: PropTypes.arrayOf(PropTypes.shape({
        type: PropTypes.string,
        label: PanneauPropTypes.label,
    })),
    className: PropTypes.string,
    onClick: PropTypes.func,
    onClickItem: PropTypes.func,
};

const defaultProps = {
    link: null,
    label: null,
    items: null,
    className: null,
    onClick: null,
    onClickItem: null,
};

const NavbarItem = ({
    items, className, onClickItem, ...linkProps
}) => {
    const hasDropdown = items !== null && items.length > 0;
    return (
        <li
            className={classNames({
                'nav-item': true,
                dropdown: hasDropdown,
                [className]: className !== null,
            })}
        >
            <NavbarLink {...linkProps} hasDropdown={hasDropdown} />
            {hasDropdown ? (
                <div className="dropdown-menu">
                    {items.map(
                        (it, index) => (get(it, 'type', 'item') === 'divider' ? (
                            <NavbarDivider key={`item-${index}`} />
                        ) : (
                            <NavbarLink
                                key={`item-${index}`}
                                {...it}
                                isDropdown
                                onClick={(e) => {
                                    if (onClickItem !== null) {
                                        onClickItem(e, it, index);
                                    }
                                }}
                            />
                        )),
                    )}
                </div>
            ) : null}
        </li>
    );
};

NavbarItem.propTypes = propTypes;
NavbarItem.defaultProps = defaultProps;

export default NavbarItem;