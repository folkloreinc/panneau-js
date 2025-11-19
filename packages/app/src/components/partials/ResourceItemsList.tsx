/* eslint-disable react/jsx-props-no-spreading */
import isObject from 'lodash-es/isObject';
import React from 'react';

import ResourceList from '@panneau/list-resource-items';

interface ResourceItemsListProps {
    resource: string | { id: string };
    [key: string]: any;
}

// Kept for backward compatibility with exports
function ResourceItemsList({ resource, ...props }: ResourceItemsListProps) {
    const { id: finalResource = null } = isObject(resource) ? resource : { id: resource };
    return <ResourceList resource={finalResource} {...props} />;
}

export default ResourceItemsList;
