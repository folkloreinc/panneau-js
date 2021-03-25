/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link as ReactLink } from 'react-router-dom';

import { PropTypes as PanneauPropTypes } from '@panneau/core';

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
};

const defaultProps = {
    href: '',
    external: false,
    target: '_blank',
    rel: 'noopener noreferrer',
    children: null,
    withoutStyle: false,
    className: null,
};

const Link = ({ href, external, children, target, rel, className, withoutStyle, ...props }) =>
    external ? (
        <a
            className={classNames([className, { [styles.withoutStyle]: withoutStyle }])}
            href={href}
            target={target}
            rel={rel}
            {...props}
        >
            <Label>{children}</Label>
        </a>
    ) : (
        <ReactLink
            className={classNames([className, { [styles.withoutStyle]: withoutStyle }])}
            to={href}
            {...props}
        >
            <Label>{children}</Label>
        </ReactLink>
    );

Link.propTypes = propTypes;
Link.defaultProps = defaultProps;

export default Link;
