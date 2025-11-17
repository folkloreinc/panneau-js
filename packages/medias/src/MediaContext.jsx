/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import React, { useContext, useMemo, useState } from 'react';

const MediaContext = React.createContext(null);

export const useCurrentMedia = () => useContext(MediaContext);

const propTypes = {
    media: PropTypes.shape({ id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]) }),
    children: PropTypes.node.isRequired,
};

export function MediaProvider({
    media: providedMedia = null,
    children
})  {
    const [currentMedia, setCurrentMedia] = useState(providedMedia);
    const values = useMemo(
        () => ({ currentMedia, setCurrentMedia }),
        [currentMedia, setCurrentMedia],
    );
    return <MediaContext.Provider value={values}>{children}</MediaContext.Provider>;
}

MediaProvider.propTypes = propTypes;

export default MediaProvider;
