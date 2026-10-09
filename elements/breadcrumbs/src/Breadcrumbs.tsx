/* eslint-disable jsx-a11y/control-has-associated-label */
import classNames from 'classnames';
import type { MouseEventHandler } from 'react';

import type { Breadcrumb, ButtonElement, Label } from '@panneau/core';
import Button from '@panneau/element-button';
import LabelComponent from '@panneau/element-label';
import Link from '@panneau/element-link';

import styles from './styles.module.css';

export interface BreadcrumbItem extends Breadcrumb {
    label?: Label;
    active?: boolean;
    onClick?: MouseEventHandler<ButtonElement> | null;
}

interface BreadcrumbsTheme {
    text?: string;
    [key: string]: unknown;
}

interface BreadcrumbsProps {
    items?: BreadcrumbItem[];
    theme?: BreadcrumbsTheme | null;
    separator?: 'arrow' | null;
    withoutBar?: boolean;
    noWrap?: boolean;
    className?: string | null;
}

const DEFAULT_ITEMS: BreadcrumbItem[] = [];

function Breadcrumbs({
    items = DEFAULT_ITEMS,
    theme = null,
    separator = null,
    withoutBar = false,
    noWrap = false,
    className = null,
}: BreadcrumbsProps) {
    return (
        <nav className={className || undefined}>
            <ol
                className={classNames([
                    styles.container,
                    'breadcrumb',
                    'mb-0',
                    {
                        'p-0': withoutBar,
                        'bg-transparent': withoutBar,
                        'rounded-0': withoutBar,
                        'flex-nowrap': noWrap,
                    },
                ])}
            >
                {items.map(({ url, label, active = false, onClick = null }, index) => (
                    <li
                        className={classNames([
                            'breadcrumb-item',
                            {
                                active,
                                [styles.arrow]: separator === 'arrow',
                                [`text-${theme?.text}`]: active && theme !== null,
                            },
                        ])}
                        key={`item-${index}`}
                    >
                        {active ? <LabelComponent>{label}</LabelComponent> : null}
                        {!active && url ? (
                            <Link
                                href={url}
                                onClick={onClick}
                                className={classNames({
                                    [`text-${theme?.text}`]: theme !== null,
                                })}
                            >
                                <LabelComponent>{label}</LabelComponent>
                            </Link>
                        ) : null}
                        {!active && !url && onClick ? (
                            <Button
                                onClick={onClick}
                                className={classNames({
                                    [`text-${theme?.text}`]: theme !== null,
                                })}
                            >
                                <LabelComponent>{label}</LabelComponent>
                            </Button>
                        ) : null}
                    </li>
                ))}
            </ol>
        </nav>
    );
}

export default Breadcrumbs;
