/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import React, { useContext, useMemo, useState } from 'react';

const MediasFormContext = React.createContext(null);

export const useMediasForm = () => useContext(MediasFormContext);

const propTypes = {
    media: PropTypes.shape({ id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]) }),
    fields: PropTypes.arrayOf(
        PropTypes.shape({ id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]) }),
    ),
    children: PropTypes.node.isRequired,
};

const defaultProps = {
    media: null,
    fields: null,
};

export function MediasFormProvider({ media: providedMedia, fields: providedFields, children }) {
    const [media, setMedia] = useState(providedMedia);
    const values = useMemo(
        () => ({ media, setMedia, fields: providedFields }),
        [media, setMedia, providedFields],
    );
    return <MediasFormContext.Provider value={values}>{children}</MediasFormContext.Provider>;
}

MediasFormProvider.propTypes = propTypes;
MediasFormProvider.defaultProps = defaultProps;

export default MediasFormProvider;
