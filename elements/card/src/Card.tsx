import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import { type ReactNode } from 'react';

import type { Label } from '@panneau/core';
import Button from '@panneau/element-button';
import LabelComponent from '@panneau/element-label';
import Link from '@panneau/element-link';

interface CardLink {
    label?: Label;
    href?: string;
    className?: string | null;
}

interface CardProps {
    href?: string | null;
    header?: ReactNode | null;
    image?: ReactNode | string | null;
    imageAlt?: string | null;
    imageOverlay?: boolean;
    beforeBody?: ReactNode | null;
    title?: Label | null;
    subtitle?: Label | null;
    children?: ReactNode | null;
    afterBody?: ReactNode | null;
    links?: CardLink[] | null;
    linksInSameBody?: boolean;
    footer?: ReactNode | null;
    theme?: 'dark' | 'primary' | 'light' | null;
    className?: string | null;
    imageClassName?: string | null;
    headerClassName?: string | null;
    titleClassName?: string | null;
    subtitleClassName?: string | null;
    bodyClassName?: string | null;
    footerClassName?: string | null;
    onClick?: (() => void) | null;
    onClickBody?: (() => void) | null;
    onClickFooter?: (() => void) | null;
    onClose?: (() => void) | null;
    onCloseIcon?: ReactNode | null;
}

function Card({
    href = null,
    header = null,
    image = null,
    imageAlt = null,
    imageOverlay = false,
    beforeBody = null,
    title = null,
    subtitle = null,
    children = null,
    afterBody = null,
    links = null,
    linksInSameBody = false,
    footer = null,
    theme = null,
    className = null,
    imageClassName = null,
    headerClassName = null,
    titleClassName = null,
    subtitleClassName = null,
    bodyClassName = null,
    footerClassName = null,
    onClick = null,
    onClickBody = null,
    onClickFooter = null,
    onClose = null,
    onCloseIcon = null,
}: CardProps) {
    const linksElements = (links || []).map(
        ({ label, className: linkClassName = null, ...linkProps }, index) => (
            <Link
                key={`link-${label}-${index}`}
                className={classNames([
                    'card-link',
                    {
                        [linkClassName!]: linkClassName !== null,
                    },
                ])}
                {...linkProps}
            >
                {label}
            </Link>
        ),
    );

    const bodyInner =
        title !== null ||
        subtitle !== null ||
        children !== null ||
        (links !== null && linksInSameBody) ? (
            <>
                {title !== null ? (
                    <h5
                        className={classNames([
                            'card-title',
                            'text-break',
                            {
                                [titleClassName!]: titleClassName !== null,
                            },
                        ])}
                    >
                        <LabelComponent>{title}</LabelComponent>
                    </h5>
                ) : null}
                {subtitle !== null ? (
                    <h6
                        className={classNames([
                            'card-subtitle',
                            {
                                [subtitleClassName!]: subtitleClassName !== null,
                            },
                        ])}
                    >
                        <LabelComponent>{subtitle}</LabelComponent>
                    </h6>
                ) : null}
                {children}
                {links !== null && linksInSameBody ? (
                    <div className="d-flex">{linksElements}</div>
                ) : null}
            </>
        ) : null;

    const closeButton = (
        <Button type="button" size="sm" theme="warning" onClick={onClose}>
            <FontAwesomeIcon icon={(onCloseIcon as any) || faTimes} />
        </Button>
    );

    const cardInner = (
        <>
            {header !== null ? (
                <div
                    className={classNames([
                        'card-header',
                        {
                            [headerClassName!]: headerClassName !== null,
                        },
                    ])}
                >
                    <LabelComponent>{header}</LabelComponent>
                </div>
            ) : null}
            {typeof image === 'string' ? (
                <img
                    src={image}
                    alt={imageAlt || undefined}
                    className={classNames([
                        'card-img-top',
                        {
                            [imageClassName!]: imageClassName !== null,
                        },
                    ])}
                />
            ) : (
                image
            )}
            {beforeBody}
            {bodyInner !== null ? (
                <div className="position-relative">
                    {onClose !== null ? (
                        <div className="d-inline-block position-absolute end-0 p-2">
                            {closeButton}
                        </div>
                    ) : null}
                    {onClickBody !== null ? (
                        <button
                            type="button"
                            className={classNames({
                                'card-body': !imageOverlay,
                                'card-img-overlay': imageOverlay,
                                [bodyClassName!]: bodyClassName !== null,
                            })}
                            onClick={onClickBody}
                        >
                            {bodyInner}
                        </button>
                    ) : (
                        <div
                            className={classNames({
                                'card-body': !imageOverlay,
                                'card-img-overlay': imageOverlay,
                                [bodyClassName!]: bodyClassName !== null,
                            })}
                        >
                            {bodyInner}
                        </div>
                    )}
                </div>
            ) : null}
            {afterBody}
            {links !== null && !linksInSameBody ? (
                <div className="card-body">{linksElements}</div>
            ) : null}
            {footer !== null ? (
                onClickFooter !== null ? (
                    <button
                        type="button"
                        className={classNames([
                            'card-footer',
                            {
                                [footerClassName!]: footerClassName !== null,
                            },
                        ])}
                        onClick={onClickFooter}
                    >
                        <LabelComponent>{footer}</LabelComponent>
                    </button>
                ) : (
                    <div
                        className={classNames([
                            'card-footer',
                            {
                                [footerClassName!]: footerClassName !== null,
                            },
                        ])}
                    >
                        <LabelComponent>{footer}</LabelComponent>
                    </div>
                )
            ) : null}
        </>
    );
    const cardClassName = classNames([
        'card',
        {
            [`bg-${theme}`]: !imageOverlay && theme !== 'dark',
            [className!]: className !== null,
        },
    ]);

    if (href !== null) {
        return (
            <Link href={href} className={cardClassName}>
                {cardInner}
            </Link>
        );
    }

    if (onClick !== null) {
        return (
            <button
                type="button"
                className={classNames(['p-0', 'text-start', cardClassName])}
                onClick={onClick}
            >
                {cardInner}
            </button>
        );
    }

    return <div className={cardClassName}>{cardInner}</div>;
}

export default Card;
