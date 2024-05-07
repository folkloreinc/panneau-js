/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import React, { useContext, useMemo } from 'react';

const MediasApiContext = React.createContext(null);

export const useMediasApi = () => useContext(MediasApiContext);

export const apiPropTypes = PropTypes.shape({
    get: PropTypes.func.isRequired,
    getTrashed: PropTypes.func.isRequired,
    create: PropTypes.func.isRequired,
    find: PropTypes.func.isRequired,
    update: PropTypes.func.isRequired,
    trash: PropTypes.func.isRequired,
    restore: PropTypes.func.isRequired,
    delete: PropTypes.func.isRequired,
});

const propTypes = {
    api: apiPropTypes,
    children: PropTypes.node.isRequired,
};

const defaultProps = {
    api: null,
};

export function MediasApiProvider({ api: providedApi, children }) {
    const previousApi = useMediasApi();
    const api = useMemo(() => providedApi || previousApi, [providedApi, previousApi]);
    return <MediasApiContext.Provider value={api}>{children}</MediasApiContext.Provider>;
}

MediasApiProvider.propTypes = propTypes;
MediasApiProvider.defaultProps = defaultProps;

export default MediasApiProvider;
