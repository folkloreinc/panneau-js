/* eslint-disable react/jsx-props-no-spreading, react/no-array-index-key */
import PropTypes from 'prop-types';
import React from 'react';

import { MediasApiProvider, apiPropTypes } from './MediasApiContext';
import { MediasFormProvider } from './MediasFormContext';
import MediasPicker from './MediasPicker';

const propTypes = {
    api: apiPropTypes,
    media: PropTypes.shape({ id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]) }),
    fields: PropTypes.arrayOf(
        PropTypes.shape({ id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]) }),
    ),
    onChange: PropTypes.func.isRequired,
};

const defaultProps = {
    api: null,
    media: null,
    fields: null,
};

function MediasPickerContainer({ api, media, fields, onChange, ...props }) {
    return (
        <MediasApiProvider api={api}>
            <MediasFormProvider media={media} fields={fields}>
                <MediasPicker {...props} onChange={onChange} />
            </MediasFormProvider>
        </MediasApiProvider>
    );
}

MediasPickerContainer.propTypes = propTypes;
MediasPickerContainer.defaultProps = defaultProps;

export default MediasPickerContainer;
