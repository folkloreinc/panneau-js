/* eslint-disable react/jsx-props-no-spreading, react/no-array-index-key */
import PropTypes from 'prop-types';
import React from 'react';

import { MediasApiProvider, apiPropTypes } from './MediasApiContext';
import MediasPicker from './MediasPicker';

const propTypes = {
    api: apiPropTypes,
    onChange: PropTypes.func.isRequired,
};

const defaultProps = {
    api: null,
};

function MediasPickerContainer({ api, onChange, ...props }) {
    return (
        <MediasApiProvider api={api}>
            <MediasPicker {...props} onChange={onChange} />
        </MediasApiProvider>
    );
}

MediasPickerContainer.propTypes = propTypes;
MediasPickerContainer.defaultProps = defaultProps;

export default MediasPickerContainer;
