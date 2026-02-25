import { createContext, use } from 'react';
import type { ReactNode } from 'react';

import type { Resource } from '../types';

const ResourceContext = createContext<Resource | null>(null);

export function useResource(): Resource | null {
    return use(ResourceContext);
}

interface ResourceProviderProps {
    resource: Resource;
    children: ReactNode;
}

function ResourceProvider({ resource, children }: ResourceProviderProps) {
    return <ResourceContext value={resource}>{children}</ResourceContext>;
}

export { ResourceProvider };
export default ResourceContext;
