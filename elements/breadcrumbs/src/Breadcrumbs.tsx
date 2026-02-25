/* eslint-disable jsx-a11y/control-has-associated-label */
import classNames from 'classnames';

import type { Breadcrumb, Label } from '@panneau/core';
import Button from '@panneau/element-button';
import LabelComponent from '@panneau/element-label';
import Link from '@panneau/element-link';

import styles from './styles.module.css';

interface BreadcrumbsProps {
    items?: Breadcrumb[];
    theme?: Record<string, unknown> | null;
    separator?: 'arrow' | null;
    withoutBar?: boolean;
    noWrap?: boolean;
    className?: string | null;
}

const DEFAULT_ITEMS: Breadcrumb[] = [];

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
                {items.map(({ url, label, active = false, onClick = null }: any, index: number) => (
                    <li
                        className={classNames([
                            'breadcrumb-item',
                            {
                                active,
                                [styles.arrow]: separator === 'arrow',
                                [`text-${(theme as any)?.text}`]: active && theme !== null,
                            },
                        ])}
                        key={`item-${index}`}
                    >
                        {active ? <LabelComponent>{label as Label}</LabelComponent> : null}
                        {!active && url ? (
                            <Link
                                href={url}
                                onClick={onClick}
                                className={classNames({
                                    [`text-${(theme as any)?.text}`]: theme !== null,
                                })}
                            >
                                <LabelComponent>{label as Label}</LabelComponent>
                            </Link>
                        ) : null}
                        {!active && onClick ? (
                            <Button
                                onClick={onClick}
                                className={classNames({
                                    [`text-${(theme as any)?.text}`]: theme !== null,
                                })}
                            >
                                <LabelComponent>{label as Label}</LabelComponent>
                            </Button>
                        ) : null}
                    </li>
                ))}
            </ol>
        </nav>
    );
}

export default Breadcrumbs;
