import PropTypes from 'prop-types';
import React from 'react';
import styles from './styles.module.scss';

const propTypes = {
    value: PropTypes.string,
    maxWidth: PropTypes.number,
    maxHeight: PropTypes.number,
};

const defaultProps = {
    value: null,
    maxWidth: 140,
    maxHeight: 100,
};

const Image = ({ value, maxWidth, maxHeight }) => {
    const { url, thumbnailUrl, description } = value || {};
    const image = thumbnailUrl || url;
    return (
        <img
            className={styles.container}
            src={image}
            alt={description}
            style={{
                maxWidth: maxWidth !== null ? parseInt(maxWidth, 10) : null,
                maxHeight: maxHeight !== null ? parseInt(maxHeight, 10) : null,
            }}
        />
    );
};

Image.propTypes = propTypes;
Image.defaultProps = defaultProps;

export default Image;
