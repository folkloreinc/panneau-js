/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import React from 'react';

import { MediaProvider } from './MediaContext';
import { MediasApiProvider, apiPropTypes } from './MediasApiContext';
import MediasBrowser from './MediasBrowser';

const propTypes = {
    api: apiPropTypes,
    media: PropTypes.shape({ id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]) }),
};

const defaultProps = {
    api: null,
    media: null
};

function MediasBrowserContainer({ api, media, ...props }) {
    return (
        <MediasApiProvider api={api}>
            <MediaProvider media={media}>
                <MediasBrowser {...props} />
            </MediaProvider>
        </MediasApiProvider>
    );
}

MediasBrowserContainer.propTypes = propTypes;
MediasBrowserContainer.defaultProps = defaultProps;

export default MediasBrowserContainer;
