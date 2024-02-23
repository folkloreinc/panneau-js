/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { Link as ReactLink, useLocation } from 'wouter';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import Button from '@panneau/element-button';
import Label from '@panneau/element-label';

import styles from './styles.module.scss';

const propTypes = {
    href: PropTypes.string,
    external: PropTypes.bool,
    target: PropTypes.string,
    children: PanneauPropTypes.label,
    rel: PropTypes.string,
    withoutStyle: PropTypes.bool,
    className: PropTypes.string,
    onClick: PropTypes.func,
};

const defaultProps = {
    href: '',
    external: false,
    target: '_blank',
    rel: 'noopener noreferrer',
    children: null,
    withoutStyle: false,
    className: null,
    onClick: null,
};

const Link = ({
    external,
    children,
    target,
    rel,
    className,
    withoutStyle,
    href,
    onClick,
    ...props
}) => {
    const inner =
        href !== null ? (
            <ReactLink href={href} onClick={onClick}>
                <a
                    className={classNames([className, { [styles.withoutStyle]: withoutStyle }])}
                    {...props}
                >
                    <Label>{children}</Label>
                </a>
            </ReactLink>
        ) : (
            <Button
                className={classNames([className, { [styles.withoutStyle]: withoutStyle }])}
                theme="primary"
                outline
                {...props}
                onClick={onClick}
            >
                <Label>{children}</Label>
            </Button>
        );
    return external ? (
        <a
            className={classNames([className, { [styles.withoutStyle]: withoutStyle }])}
            target={target}
            rel={rel}
            href={href}
            onClick={onClick}
            {...props}
        >
            <Label>{children}</Label>
        </a>
    ) : (
        inner
    );
};

Link.propTypes = propTypes;
Link.defaultProps = defaultProps;

export default Link;
