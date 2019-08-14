/* eslint-disable jsx-a11y/anchor-is-valid, react/button-has-type, react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import isString from 'lodash/isString';
import { Link } from 'react-router-dom';

import Label from './Label';
import * as PanneauPropTypes from '../lib/PropTypes';

const propTypes = {
    type: PropTypes.string,
    size: PanneauPropTypes.buttonSize,
    style: PanneauPropTypes.buttonStyle,
    href: PropTypes.string,
    target: PropTypes.string,
    external: PropTypes.bool,
    dropdown: PanneauPropTypes.dropdownItems,
    icon: PropTypes.string,
    className: PropTypes.string,
    label: PanneauPropTypes.label,
    children: PanneauPropTypes.label,
    onClick: PropTypes.func,
    onItemClick: PropTypes.func,
};

const defaultProps = {
    type: 'button',
    size: null,
    style: 'primary',
    href: null,
    target: null,
    external: false,
    dropdown: null,
    icon: null,
    className: null,
    label: null,
    children: null,
    onClick: null,
    onItemClick: null,
};

const Button = ({
    type,
    size,
    style,
    href,
    external,
    target,
    icon,
    dropdown,
    label,
    children,
    className,
    onClick,
    onItemClick,
    ...props
}) => {
    const hasDropdown = dropdown !== null && dropdown.length > 0;
    const buttonProps = {
        className: classNames(['btn'], {
            [`btn-${style}`]: style !== null,
            [`btn-${size}`]: !hasDropdown && size !== null,
            'dropdown-toggle': hasDropdown,
            [className]: className !== null,
        }),
        ...props,
    };
    if (hasDropdown) {
        buttonProps['data-toggle'] = 'dropdown';
        buttonProps['aria-haspopup'] = 'true';
        buttonProps['aria-expanded'] = 'false';
    } else {
        buttonProps.onClick = onClick;
    }

    const finalLabel = children || label;

    const inner = (
        <>
            {isString(icon) ? <span className={icon} /> : icon}
            {<Label>{finalLabel}</Label>}
            {hasDropdown ? <span className="caret" /> : null}
        </>
    );

    let button;
    if (!hasDropdown && href !== null) {
        button = external ? (
            <a href={href} {...buttonProps} target={target}>
                {inner}
            </a>
        ) : (
            <Link to={href} {...buttonProps}>
                {inner}
            </Link>
        );
    } else {
        button = (
            <button type={type} {...buttonProps}>
                {inner}
            </button>
        );
    }

    return hasDropdown ? (
        <div
            className={classNames([
                'btn-group',
                {
                    [`btn-group-${size}`]: hasDropdown && size !== null,
                },
            ])}
        >
            {button}
            <ul className="dropdown-menu">
                {dropdown.map((it, index) => {
                    const {
                        href: itemHref,
                        label: itemLabel,
                        external: itemExternal = false,
                        target: itemTarget = null,
                        onClick: itemOnClick = null,
                    } = it;
                    const itemProps = {
                        className: 'dropdown-item',
                        key: `dropdown-${index}`,
                        onClick: e => {
                            if (itemOnClick !== null) {
                                itemOnClick(e, it, index);
                            }
                            if (onItemClick !== null) {
                                onItemClick(e, it, index);
                            }
                        },
                    };

                    return itemExternal ? (
                        <a {...itemProps} href={itemHref} target={itemTarget}>
                            <Label>{itemLabel}</Label>
                        </a>
                    ) : (
                        <Link {...itemProps} to={itemHref}>
                            <Label>{itemLabel}</Label>
                        </Link>
                    );
                })}
            </ul>
        </div>
    ) : (
        button
    );
};

Button.propTypes = propTypes;
Button.defaultProps = defaultProps;

export default Button;
