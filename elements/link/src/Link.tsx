/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import React from 'react';
import { Link as ReactLink } from 'wouter';

import type { Label as LabelType } from '@panneau/core/types';
import Button from '@panneau/element-button';
import Label from '@panneau/element-label';

import styles from './styles.module.css';

interface LinkProps {
    href?: string | null;
    external?: boolean;
    target?: string;
    children?: LabelType | null;
    rel?: string;
    withoutStyle?: boolean;
    className?: string | null;
    onClick?: (() => void) | null;
}

function Link({
    external = false,
    children = null,
    target = '_blank',
    rel = 'noopener noreferrer',
    className = null,
    withoutStyle = false,
    href = '',
    onClick = null,
    ...props
}: LinkProps) {
    const inner =
        href !== null ? (
            <ReactLink
                href={href}
                onClick={onClick || undefined}
                className={classNames([className, { [styles.withoutStyle]: withoutStyle }])}
                {...props}
            >
                <Label>{children!}</Label>
            </ReactLink>
        ) : (
            <Button
                className={classNames([className, { [styles.withoutStyle]: withoutStyle }])}
                theme="primary"
                outline
                {...props}
                onClick={onClick}
            >
                <Label>{children!}</Label>
            </Button>
        );
    return external ? (
        <a
            className={classNames([className, { [styles.withoutStyle]: withoutStyle }])}
            target={target}
            rel={rel}
            href={href || undefined}
            onClick={onClick || undefined}
            {...props}
        >
            <Label>{children!}</Label>
        </a>
    ) : (
        inner
    );
}

export default Link;
