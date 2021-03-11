/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link as ReactLink } from 'react-router-dom';

import { PropTypes as MicromagPropTypes } from '../../lib';

import Label from './Label';

import styles from '../../styles/partials/link.module.scss';

const propTypes = {
    href: PropTypes.string,
    external: PropTypes.bool,
    target: PropTypes.string,
    children: MicromagPropTypes.label,
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
