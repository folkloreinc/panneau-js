/* eslint-disable jsx-a11y/anchor-is-valid, react/button-has-type, react/jsx-props-no-spreading */
import classNames from 'classnames';
import isString from 'lodash-es/isString';
import React from 'react';
import { Link } from 'wouter';

import type { ButtonSize, ButtonTheme, Label } from '@panneau/core/types';
import Icon from '@panneau/element-icon';

import styles from './styles.module.css';

interface ButtonProps {
    type?: string;
    theme?: ButtonTheme;
    size?: ButtonSize;
    href?: string | null;
    external?: boolean;
    direct?: boolean;
    target?: string;
    label?: Label | null;
    children?: Label | null;
    active?: boolean;
    underlined?: boolean;
    icon?: React.ReactNode | string | null;
    iconPosition?: 'left' | 'right' | 'inline';
    disabled?: boolean;
    loading?: boolean;
    disableOnLoading?: boolean;
    withShadow?: boolean;
    withoutStyle?: boolean;
    withoutTheme?: boolean;
    outline?: boolean;
    asLink?: boolean;
    className?: string | null;
    iconClassName?: string | null;
    labelClassName?: string | null;
    onClick?: (() => void) | null;
    refButton?: React.Ref<any> | null;
}

function Button({
    type = 'button',
    theme = null,
    size = null,
    href = null,
    external = false,
    direct = false,
    target = '_blank',
    label = null,
    children = null,
    active = false,
    underlined = false,
    icon = null,
    iconPosition = 'inline',
    disabled = false,
    loading = false,
    disableOnLoading = true,
    withShadow = false,
    withoutStyle = false,
    withoutTheme = false,
    asLink = false,
    outline = false,
    onClick = null,
    className = null,
    iconClassName = null,
    labelClassName = null,
    refButton = null,
    ...props
}: ButtonProps) {
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
                                [iconClassName!]: iconClassName !== null,
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
                                    [labelClassName!]: labelClassName !== null,
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
                                [iconClassName!]: iconClassName !== null && iconPosition === 'left',
                            },
                        ])}
                    >
                        {iconPosition === 'left' ? finalIcon : null}
                    </span>
                    <span
                        className={classNames([
                            styles.center,
                            {
                                [labelClassName!]: labelClassName !== null,
                            },
                        ])}
                    >
                        {text}
                    </span>
                    <span
                        className={classNames([
                            styles.right,
                            {
                                [iconClassName!]: iconClassName !== null && iconPosition === 'right',
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
            [`text-decoration-underline`]: !withoutStyle && underlined,
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
            [className!]: className !== null,
        },
    ]);

    if (href !== null && !disabled) {
        return external || direct ? (
            <a
                {...props}
                href={href}
                className={buttonClassNames}
                onClick={onClick || undefined}
                target={external ? target : undefined}
                ref={refButton}
            >
                {content}
            </a>
        ) : (
            <Link href={href} onClick={onClick || undefined} className={buttonClassNames} ref={refButton}>
                {content}
            </Link>
        );
    }

    return (
        <button
            {...props}
            type={type}
            className={buttonClassNames}
            onClick={onClick || undefined}
            disabled={disabled || (disableOnLoading && loading)}
            ref={refButton}
        >
            {content}
        </button>
    );
}

export default Button;
