/* eslint-disable react/jsx-props-no-spreading */
import React, { useContext } from 'react';
import type { ReactNode } from 'react';
import type { Resource } from '@panneau/core/types';

const ResourceContext = React.createContext<Resource | null>(null);

export const useResource = (): Resource | null => useContext(ResourceContext);

interface ResourceProviderProps {
    resource: Resource;
    children: ReactNode;
}

function ResourceProvider({ resource, children }: ResourceProviderProps) {
    return <ResourceContext.Provider value={resource}>{children}</ResourceContext.Provider>;
}

export { ResourceProvider };
export default ResourceContext;
