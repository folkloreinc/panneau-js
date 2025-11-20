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
    return <ResourceContext value={resource}>{children}</ResourceContext>;
}

export { ResourceProvider };
export default ResourceContext;
