/* eslint-disable no-nested-ternary */

/* eslint-disable react/jsx-props-no-spreading, react/no-array-index-key */
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import { PropTypes as MicromagPropTypes } from '@panneau/core';
import Button from '@panneau/element-button';
import Label from '@panneau/element-label';
import Link from '@panneau/element-link';

const propTypes = {
    href: PropTypes.string,
    header: PropTypes.node,
    image: PropTypes.node,
    imageAlt: PropTypes.string,
    imageOverlay: PropTypes.bool,
    beforeBody: PropTypes.node,
    title: MicromagPropTypes.label,
    subtitle: MicromagPropTypes.label,
    children: PropTypes.node,
    afterBody: PropTypes.node,
    links: PropTypes.arrayOf(
        PropTypes.shape({
            label: MicromagPropTypes.label,
            href: PropTypes.string,
        }),
    ),
    linksInSameBody: PropTypes.bool,
    footer: PropTypes.node,
    theme: PropTypes.oneOf([null, 'dark', 'primary', 'light']),
    className: PropTypes.string,
    imageClassName: PropTypes.string,
    headerClassName: PropTypes.string,
    titleClassName: PropTypes.string,
    subtitleClassName: PropTypes.string,
    bodyClassName: PropTypes.string,
    footerClassName: PropTypes.string,
    onClick: PropTypes.func,
    onClickBody: PropTypes.func,
    onClickFooter: PropTypes.func,
    onClose: PropTypes.func,
    onCloseIcon: PropTypes.node,
};

const defaultProps = {
    href: null,
    header: null,
    image: null,
    imageAlt: null,
    imageOverlay: false,
    beforeBody: null,
    title: null,
    subtitle: null,
    children: null,
    afterBody: null,
    links: null,
    linksInSameBody: false,
    footer: null,
    theme: null,
    className: null,
    imageClassName: null,
    headerClassName: null,
    titleClassName: null,
    subtitleClassName: null,
    bodyClassName: null,
    footerClassName: null,
    onClick: null,
    onClickBody: null,
    onClickFooter: null,
    onClose: null,
    onCloseIcon: null,
};

const Card = ({
    href,
    header,
    image,
    imageAlt,
    imageOverlay,
    beforeBody,
    title,
    subtitle,
    children,
    afterBody,
    links,
    linksInSameBody,
    footer,
    theme,
    className,
    imageClassName,
    headerClassName,
    titleClassName,
    subtitleClassName,
    bodyClassName,
    footerClassName,
    onClick,
    onClickBody,
    onClickFooter,
    onClose,
    onCloseIcon,
}) => {
    const linksElements = (links || []).map(
        ({ label, className: linkClassName = null, ...linkProps }, index) => (
            <Link
                key={`link-${label}-${index}`}
                className={classNames([
                    'card-link',
                    {
                        [linkClassName]: linkClassName !== null,
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
                            {
                                [titleClassName]: titleClassName !== null,
                            },
                        ])}
                    >
                        <Label>{title}</Label>
                    </h5>
                ) : null}
                {subtitle !== null ? (
                    <h6
                        className={classNames([
                            'card-subtitle',
                            {
                                [subtitleClassName]: subtitleClassName !== null,
                            },
                        ])}
                    >
                        <Label>{subtitle}</Label>
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
            <FontAwesomeIcon icon={onCloseIcon || faTimes} />
        </Button>
    );

    const cardInner = (
        <>
            {header !== null ? (
                <div
                    className={classNames([
                        'card-header',
                        {
                            [headerClassName]: headerClassName !== null,
                        },
                    ])}
                >
                    <Label>{header}</Label>
                </div>
            ) : null}
            {typeof image === 'string' ? (
                <img
                    src={image}
                    alt={imageAlt}
                    className={classNames([
                        'card-img-top',
                        {
                            [imageClassName]: imageClassName !== null,
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
                                [bodyClassName]: bodyClassName !== null,
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
                                [bodyClassName]: bodyClassName !== null,
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
                                [footerClassName]: footerClassName !== null,
                            },
                        ])}
                        onClick={onClickFooter}
                    >
                        <Label>{footer}</Label>
                    </button>
                ) : (
                    <div
                        className={classNames([
                            'card-footer',
                            {
                                [footerClassName]: footerClassName !== null,
                            },
                        ])}
                    >
                        <Label>{footer}</Label>
                    </div>
                )
            ) : null}
        </>
    );
    const cardClassName = classNames([
        'card',
        {
            [`bg-${theme}`]: !imageOverlay && theme !== 'dark',
            'bg-dark': imageOverlay || theme === 'dark',
            'text-dark': theme === 'light',
            'text-light': imageOverlay || theme === 'dark' || theme === 'primary',
            [className]: className !== null,
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
};

Card.propTypes = propTypes;
Card.defaultProps = defaultProps;

export default Card;
