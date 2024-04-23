/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import React from 'react';

import { MediasApiProvider, apiPropTypes } from './MediasApiContext';
import MediasBrowser from './MediasBrowser';
import { MediasFormProvider } from './MediasFormContext';

const propTypes = {
    api: apiPropTypes,
    media: PropTypes.shape({ id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]) }),
    fields: PropTypes.arrayOf(
        PropTypes.shape({ id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]) }),
    ),
};

const defaultProps = {
    api: null,
    media: null,
    fields: null,
};

function MediasBrowserContainer({ api, media, fields, ...props }) {
    return (
        <MediasApiProvider api={api}>
            <MediasFormProvider media={media} fields={fields}>
                <MediasBrowser {...props} />
            </MediasFormProvider>
        </MediasApiProvider>
    );
}

MediasBrowserContainer.propTypes = propTypes;
MediasBrowserContainer.defaultProps = defaultProps;

export default MediasBrowserContainer;
