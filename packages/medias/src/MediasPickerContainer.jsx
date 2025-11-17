/* eslint-disable react/jsx-props-no-spreading, react/no-array-index-key */
import PropTypes from 'prop-types';
import React from 'react';

import { MediaProvider } from './MediaContext';
import { MediasApiProvider, apiPropTypes } from './MediasApiContext';
import MediasPicker from './MediasPicker';

const propTypes = {
    api: apiPropTypes,
    media: PropTypes.shape({ id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]) }),
    onChange: PropTypes.func.isRequired,
};

function MediasPickerContainer({
    api = null,
    media = null,
    onChange,
    ...props
})  {
    return (
        <MediasApiProvider api={api}>
            <MediaProvider media={media}>
                <MediasPicker {...props} onChange={onChange} />
            </MediaProvider>
        </MediasApiProvider>
    );
}

MediasPickerContainer.propTypes = propTypes;

export default MediasPickerContainer;
