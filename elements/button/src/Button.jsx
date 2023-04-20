/* eslint-disable react/button-has-type, react/jsx-props-no-spreading */
import classNames from 'classnames';
import isString from 'lodash/isString';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import Icon from '@panneau/element-icon';

import styles from './styles.module.scss';

const propTypes = {
    type: PropTypes.string,
    theme: PanneauPropTypes.buttonTheme,
    size: PanneauPropTypes.buttonSize,
    href: PropTypes.string,
    external: PropTypes.bool,
    direct: PropTypes.bool,
    target: PropTypes.string,
    label: PanneauPropTypes.label,
    children: PanneauPropTypes.label,
    active: PropTypes.bool,
    underlined: PropTypes.bool,
    icon: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
    iconPosition: PropTypes.oneOf(['left', 'right', 'inline']),
    disabled: PropTypes.bool,
    loading: PropTypes.bool,
    disableOnLoading: PropTypes.bool,
    withShadow: PropTypes.bool,
    withoutStyle: PropTypes.bool,
    withoutTheme: PropTypes.bool,
    outline: PropTypes.bool,
    asLink: PropTypes.bool,
    className: PropTypes.string,
    iconClassName: PropTypes.string,
    labelClassName: PropTypes.string,
    onClick: PropTypes.func,
    refButton: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.shape({
            current: PropTypes.any, // eslint-disable-line
        }),
    ]),
};

const defaultProps = {
    type: 'button',
    theme: null,
    size: null,
    href: null,
    external: false,
    direct: false,
    target: '_blank',
    label: null,
    children: null,
    active: false,
    underlined: false,
    icon: null,
    iconPosition: 'inline',
    disabled: false,
    loading: false,
    disableOnLoading: true,
    withShadow: false,
    withoutStyle: false,
    withoutTheme: false,
    outline: false,
    asLink: false,
    className: null,
    iconClassName: null,
    labelClassName: null,
    onClick: null,
    refButton: null,
};

const Button = ({
    type,
    theme,
    size,
    href,
    external,
    direct,
    target,
    label,
    children,
    active,
    underlined,
    icon,
    iconPosition,
    disabled,
    loading,
    disableOnLoading,
    withShadow,
    withoutStyle,
    withoutTheme,
    asLink,
    outline,
    onClick,
    className,
    iconClassName,
    labelClassName,
    refButton,
    ...props
}) => {
    const finalLabel = label || children;
    const text = finalLabel !== null ? finalLabel : null;
    const hasChildren = label !== null && children !== null;
    const hasIcon = icon !== null;
    const hasInlineIcon = hasIcon && (iconPosition === 'inline' || text === null);
    const hasIconColumns = hasIcon && !hasInlineIcon;
    const finalIcon = isString(icon) ? <Icon name={icon} /> : icon;

    const content = (
        <>
            {hasInlineIcon ? (
                <>
                    <span
                        className={classNames([
                            styles.icon,
                            {
                                [iconClassName]: iconClassName !== null,
                            },
                        ])}
                    >
                        {finalIcon}
                    </span>
                    {text !== null ? (
                        <span
                            className={classNames([
                                styles.label,
                                {
                                    [labelClassName]: labelClassName !== null,
                                },
                            ])}
                        >
                            {text}
                        </span>
                    ) : null}
                </>
            ) : null}
            {hasIconColumns ? (
                <>
                    <span
                        className={classNames([
                            styles.left,
                            {
                                [iconClassName]: iconClassName !== null && iconPosition === 'left',
                            },
                        ])}
                    >
                        {iconPosition === 'left' ? finalIcon : null}
                    </span>
                    <span
                        className={classNames([
                            styles.center,
                            {
                                [labelClassName]: labelClassName !== null,
                            },
                        ])}
                    >
                        {text}
                    </span>
                    <span
                        className={classNames([
                            styles.right,
                            {
                                [iconClassName]: iconClassName !== null && iconPosition === 'right',
                            },
                        ])}
                    >
                        {iconPosition === 'right' ? finalIcon : null}
                    </span>
                    {hasChildren ? children : null}
                </>
            ) : null}
            {!hasIcon ? text : null}
            {hasChildren ? children : null}
        </>
    );

    const withStyle = !withoutTheme && !withoutStyle && !asLink;

    const buttonClassNames = classNames([
        {
            btn: withStyle,
            [`btn-${outline ? 'outline-' : ''}${theme}`]: withStyle && theme !== null,
            [`btn-${size}`]: withStyle && size !== null,
            active: !withoutStyle && active,
        },
        styles.container,
        {
            [styles.withoutStyle]: withoutStyle,
            [styles.withIcon]: hasIcon,
            [styles.withIconColumns]: hasIconColumns,
            [styles.withText]: text !== null,
            [styles.withShadow]: withShadow,
            [styles.isLink]: href !== null,
            [styles.asLink]: asLink,
            [styles.isDisabled]: disabled,
            [styles.isLoading]: loading,
            [styles.active]: !withoutStyle && active,
            [styles.underlined]: !withoutStyle && underlined,
            [className]: className !== null,
        },
    ]);
    if (href !== null) {
        return external || direct ? (
            <a
                {...props}
                href={href}
                className={buttonClassNames}
                onClick={onClick}
                target={external ? target : null}
                ref={refButton}
            >
                {content}
            </a>
        ) : (
            <Link to={href} className={buttonClassNames} onClick={onClick} ref={refButton}>
                {content}
            </Link>
        );
    }

    return (
        <button
            {...props}
            type={type}
            className={buttonClassNames}
            onClick={onClick}
            disabled={disabled || (disableOnLoading && loading)}
            ref={refButton}
        >
            {content}
        </button>
    );
};

Button.propTypes = propTypes;
Button.defaultProps = defaultProps;

export default Button;
