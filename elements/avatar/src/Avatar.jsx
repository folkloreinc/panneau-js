import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import styles from './styles.module.scss';

const propTypes = {
    name: PropTypes.string,
    shortName: PropTypes.string,
    type: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
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
    blended: PropTypes.bool,
    className: PropTypes.string,
    children: PropTypes.node,
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
    blended: false,
    className: null,
    children: null,
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
    blended,
    className,
    children,
}) => {
    const { text: textTheme, background: backgroundTheme, border: borderTheme } = theme || {};
    const title = name || shortName || type;
    const { url: imageUrl = null } = image || {};
    const withImage = imageUrl !== null;

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
                    [styles.blend]: withImage && blended,
                    [styles.hidden]: !withImage && shortName === null,
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
