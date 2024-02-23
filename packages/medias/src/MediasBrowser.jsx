/* eslint-disable react/jsx-props-no-spreading, react/no-array-index-key */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.module.scss';
import { useMediasApi } from './MediasApiContext';

const propTypes = {

    className: PropTypes.string,
};

const defaultProps = {
    className: null,
};

function MediasBrowser({ className }) {
    return <div className={classNames([styles.container, className])}>gfsdgsdfg</div>;
};

MediasBrowser.propTypes = propTypes;
MediasBrowser.defaultProps = defaultProps;

export default MediasBrowser;
