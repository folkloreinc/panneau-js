/* eslint-disable react/button-has-type, react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link } from 'react-router-dom';

import { PropTypes as MicromagPropTypes } from '@panneau/core';

import styles from './button.module.scss';

const propTypes = {
    type: PropTypes.string,
    theme: MicromagPropTypes.buttonTheme,
    size: MicromagPropTypes.buttonSize,
    href: PropTypes.string,
    external: PropTypes.bool,
    direct: PropTypes.bool,
    target: PropTypes.string,
    label: MicromagPropTypes.label,
    children: MicromagPropTypes.label,
    active: PropTypes.bool,
    icon: PropTypes.node,
    iconPosition: PropTypes.oneOf(['left', 'right', 'inline']),
    disabled: PropTypes.bool,
    loading: PropTypes.bool,
    disableOnLoading: PropTypes.bool,
    small: PropTypes.bool,
    big: PropTypes.bool,
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
    icon: null,
    iconPosition: 'inline',
    disabled: false,
    loading: false,
    disableOnLoading: true,
    small: false,
    big: false,
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
    icon,
    iconPosition,
    disabled,
    loading,
    disableOnLoading,
    small,
    big,
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
                        {icon}
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
                        {iconPosition === 'left' ? icon : null}
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
                        {iconPosition === 'right' ? icon : null}
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
            [styles.isSmall]: small,
            [styles.isBig]: big,
            [styles.isLink]: href !== null,
            [styles.asLink]: asLink,
            [styles.isDisabled]: disabled,
            [styles.isLoading]: loading,
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
