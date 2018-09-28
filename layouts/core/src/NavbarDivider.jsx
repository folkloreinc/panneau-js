import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const propTypes = {
    isDropdown: PropTypes.bool,
    className: PropTypes.string,
};

const defaultProps = {
    isDropdown: false,
    className: null,
};

const NavbarDivider = ({ isDropdown, className }) => (
    isDropdown ? (
        <div
            className={classNames([
                'dropdown-divider',
                {
                    [className]: className !== null,
                },
            ])}
        />
    ) : (
        <li
            className={classNames([
                'nav-item',
                'divider',
                {
                    [className]: className !== null,
                },
            ])}
        />
    )
);

NavbarDivider.propTypes = propTypes;
NavbarDivider.defaultProps = defaultProps;

export default NavbarDivider;
