/* eslint-disable react/jsx-props-no-spreading, react/no-array-index-key */
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { usePanneauResource } from '@panneau/core/contexts';
import { useApi } from '@panneau/data';

import MediasBrowserContainer from './MediasBrowserContainer';

const propTypes = {
    resource: PropTypes.string,
};

const defaultProps = {
    resource: 'medias',
};

function MediasResourceBrowser({ resource: resourceId, ...props }) {
    const resource = usePanneauResource(resourceId);
    const api = useApi();
    const mediasApi = useMemo(
        () => ({
            get: (...args) => api.resources.get(resource, ...args),
            find: (...args) => api.resources.find(resource, ...args),
            create: (...args) => api.resources.create(resource, ...args),
            update: (...args) => api.resources.update(resource, ...args),
            delete: (...args) => api.resources.delete(resource, ...args),
        }),
        [api, resource],
    );
    return <MediasBrowserContainer api={mediasApi} {...props} />;
}

MediasResourceBrowser.propTypes = propTypes;
MediasResourceBrowser.defaultProps = defaultProps;

export default MediasResourceBrowser;
