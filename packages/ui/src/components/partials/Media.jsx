/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { PropTypes as PanneauPropTypes } from '../../lib';
import Label from './Label';

import styles from '../../styles/partials/media.module.scss';

const propTypes = {
    thumbnail: PropTypes.node,
    thumbnailAlign: PropTypes.oneOf(['top', 'center', 'bottom']),
    children: PropTypes.node,
    title: PanneauPropTypes.label,
    className: PropTypes.string,
    thumbnailClassName: PropTypes.string,
    bodyClassName: PropTypes.string,
    titleClassName: PropTypes.string,
};

const defaultProps = {
    thumbnail: null,
    thumbnailAlign: 'top',
    children: null,
    title: null,
    className: null,
    thumbnailClassName: null,
    bodyClassName: null,
    titleClassName: null,
};

const Media = ({
    thumbnail,
    thumbnailAlign,
    children,
    title,
    className,
    thumbnailClassName,
    bodyClassName,
    titleClassName,
}) => (
    <div
        className={classNames([
            'media',
            styles.container,
            {
                [className]: className !== null,
            },
        ])}
    >
        {typeof thumbnail === 'string' ? (
            <img
                src={thumbnail}
                alt={title}
                className={classNames([
                    'me-3',
                    styles.thumbnail,
                    {
                        'align-self-start': thumbnailAlign === 'top',
                        'align-self-center': thumbnailAlign === 'center',
                        'align-self-end': thumbnailAlign === 'bottom',
                        [thumbnailClassName]: thumbnailClassName !== null,
                    },
                ])}
            />
        ) : (
            thumbnail
        )}
        <div
            className={classNames([
                'media-body',
                styles.body,
                {
                    [bodyClassName]: bodyClassName !== null,
                },
            ])}
        >
            {title !== null ? (
                <h5
                    className={classNames([
                        'mt-0',
                        styles.title,
                        {
                            [titleClassName]: titleClassName !== null,
                        },
                    ])}
                >
                    <Label>{title}</Label>
                </h5>
            ) : null}
            {children}
        </div>
    </div>
);

Media.propTypes = propTypes;
Media.defaultProps = defaultProps;

export default Media;
