/* eslint-disable react/jsx-props-no-spreading, react/no-array-index-key */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import { MediasApiProvider, apiPropTypes } from './MediasApiContext';
import MediasBrowser from './MediasBrowser';

const propTypes = {
    api: apiPropTypes,
};

const defaultProps = {
    api: null,
};

function MediasBrowserContainer({ api, ...props }) {
    return (
        <MediasApiProvider api={api}>
            <MediasBrowser {...props} />
        </MediasApiProvider>
    );
}

MediasBrowserContainer.propTypes = propTypes;
MediasBrowserContainer.defaultProps = defaultProps;

export default MediasBrowserContainer;
