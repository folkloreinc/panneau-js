import { useMemo } from 'react';
import isObject from 'lodash/isObject';

import ResourceApi from './ResourceApi';
import { useDefinition } from '../contexts/Definition';
import { useUrlGenerator } from '../contexts/UrlGenerator';

const useResourceApi = resourceId => {
    const definition = useDefinition();
    const urlGenerator = useUrlGenerator();
    const api = useMemo(() => {
        const { endpointHost = '/', resources = [] } = definition || {};
        const resource = isObject(resourceId)
            ? resourceId
            : resources.find(it => it.id === resourceId);
        return new ResourceApi(resource, urlGenerator, {
            host: endpointHost,
        });
    }, [resourceId, definition, urlGenerator]);
    return api;
};

export default useResourceApi;
