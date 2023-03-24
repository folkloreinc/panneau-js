import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
// import Button from '@panneau/element-button';
// import Icon from '@panneau/element-icon';
import { FormattedMessage } from 'react-intl';

import { PropTypes as PanneauPropTypes } from '@panneau/core';

import styles from './styles.module.scss';

const propTypes = {
    name: PropTypes.string,
    shortName: PropTypes.string,
    type: PropTypes.string,
    image: PropTypes.shape({
        url: PropTypes.string,
    }),
    theme: PropTypes.shape({
        text: PropTypes.string,
        background: PropTypes.string,
        border: PropTypes.string,
    }),
    square: PropTypes.bool,
    size: PropTypes.string,
    inverted: PropTypes.bool,
    children: PanneauPropTypes.label.isRequired,
    className: PropTypes.string,
};

const defaultProps = {
    name: null,
    shortName: null,
    type: <FormattedMessage defaultMessage="User" description="Avatar label" />,
    image: null,
    theme: null,
    size: null,
    square: false,
    inverted: false,
    className: null,
};

const Avatar = ({
    name,
    shortName,
    type,
    image,
    theme,
    size,
    square,
    inverted,
    className,
    children,
}) => {
    const { text: textTheme, background: backgroundTheme, border: borderTheme } = theme || {};
    const withImage = image !== null && image.url !== null;
    const title = name || shortName || type;
    return (
        <div
            className={classNames([
                styles.container,
                {
                    [`text-${textTheme}`]: textTheme !== null,
                    [`bg-${backgroundTheme}`]: backgroundTheme !== null,
                    [`border-${borderTheme}`]: borderTheme !== null,
                    [styles[size]]: size !== null,
                    [styles.square]: square,
                    [styles.inverted]: inverted,
                    [styles.blend]: withImage,
                    [className]: className !== null,
                },
            ])}
            style={{
                ...(withImage ? { backgroundImage: `url(${image.url})` } : null),
            }}
            title={title}
        >
            {!withImage && shortName !== null ? (
                <span className={styles.letter}>{shortName}</span>
            ) : null}
            {withImage ? (
                <img className={styles.image} src={image.url} title={title} alt={title} />
            ) : null}
            {children}
        </div>
    );
};
Avatar.propTypes = propTypes;
Avatar.defaultProps = defaultProps;

export default Avatar;
