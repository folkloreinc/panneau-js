/* eslint-disable react/jsx-props-no-spreading */
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { getComponentFromName } from '@panneau/core/utils';
import { useResourceItems } from '@panneau/data';
import { useListsComponents } from '@panneau/core/contexts';
import { useResourceUrlGenerator } from '@panneau/core/contexts';

import ResourceFilters from './ResourceFilters';

const propTypes = {
    resource: PanneauPropTypes.resource.isRequired,
    query: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    type: PropTypes.string,
    paginated: PropTypes.bool,
    component: PropTypes.oneOfType([PropTypes.elementType, PropTypes.string]),
    withoutFilters: PropTypes.bool,
    onQueryChange: PropTypes.func,
};

const defaultProps = {
    query: null,
    type: null,
    paginated: true,
    component: null,
    withoutFilters: true,
    onQueryChange: null,
};

const ResourceItemsList = ({
    resource,
    type,
    query,
    onQueryChange,
    paginated,
    withoutFilters,
    component,
    ...props
}) => {
    const ListComponents = useListsComponents();
    const urlGenerator = useResourceUrlGenerator(resource);
    const { page = 1 } = query || {};
    const items = useResourceItems(resource, query, paginated ? parseInt(page, 10) : null);
    const onListQueryChange = useCallback(
        (newQuery) => {
            if (onQueryChange !== null) {
                onQueryChange(newQuery);
            }
        },
        [onQueryChange],
    );
    const ListComponent = getComponentFromName(type || component || 'table', ListComponents, null);

    return (
        <>
            {!withoutFilters ? (
                <ResourceFilters
                    filters={[]}
                    value={query}
                    onSubmit={onQueryChange}
                    className="mb-4"
                />
            ) : null}
            {ListComponent !== null ? (
                <ListComponent
                    {...props}
                    {...items}
                    resource={resource}
                    query={query}
                    onQueryChange={onListQueryChange}
                    urlGenerator={urlGenerator}
                />
            ) : null}
        </>
    );
};

ResourceItemsList.propTypes = propTypes;
ResourceItemsList.defaultProps = defaultProps;

export default ResourceItemsList;
