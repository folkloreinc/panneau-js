/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import React, { useContext, useMemo, useState } from 'react';

const MediasFormContext = React.createContext(null);

export const useMediasForm = () => useContext(MediasFormContext);

const propTypes = {
    media: PropTypes.shape({ id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]) }),
    children: PropTypes.node.isRequired,
};

const defaultProps = {
    media: null,
};

export function MediasFormProvider({ media: providedMedia, children }) {
    const [media, setMedia] = useState(providedMedia);
    const values = useMemo(() => ({ media, setMedia }), [media, setMedia]);
    return <MediasFormContext.Provider value={values}>{children}</MediasFormContext.Provider>;
}

MediasFormProvider.propTypes = propTypes;
MediasFormProvider.defaultProps = defaultProps;

export default MediasFormProvider;
