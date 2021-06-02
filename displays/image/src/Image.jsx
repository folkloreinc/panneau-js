import React from 'react';
import PropTypes from 'prop-types';

import styles from './styles.module.scss';

const propTypes = {
    value: PropTypes.string,
};

const defaultProps = {
    value: null,
};

const Image = ({ value }) => {
    const { url, thumbnailUrl, description } = value || {};
    const image = thumbnailUrl || url;
    return <img className={styles.container} src={image} alt={description || 'Preview'} />;
};

Image.propTypes = propTypes;
Image.defaultProps = defaultProps;

export default Image;
