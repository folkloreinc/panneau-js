import { useMemo } from 'react';
import isObject from 'lodash/isObject';

import ResourceApi from './ResourceApi';
import { useDefinition } from '../contexts/Definition';
import { useUrlGenerator } from '../contexts/UrlGenerator';

const useResourceApi = resourceId => {
    const definition = useDefinition();
    const urlGenerator = useUrlGenerator();
    const api = useMemo(() => {
        const resource = isObject(resourceId) ? resourceId : definition.resource(resourceId);
        return new ResourceApi(resource, urlGenerator, {
            host: definition.apiEndpoint(),
        });
    }, [resourceId, definition, urlGenerator]);
    return api;
};

export default useResourceApi;
