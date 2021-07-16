/* eslint-disable react/jsx-props-no-spreading */
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useListsComponents, usePanneauColorScheme } from '@panneau/core/contexts';
import { getComponentFromName } from '@panneau/core/utils';
import { useResourceItems } from '@panneau/data';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import ResourceFilters from './ResourceFilters';

const propTypes = {
    resource: PanneauPropTypes.resource.isRequired,
    query: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    paginated: PropTypes.bool,
    baseUrl: PropTypes.string,
    component: PropTypes.oneOfType([PropTypes.elementType, PropTypes.string]),
    componentProps: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    onQueryChange: PropTypes.func,
};

const defaultProps = {
    query: null,
    paginated: true,
    component: null,
    baseUrl: null,
    componentProps: null,
    onQueryChange: null,
};

const ResourceItemsList = ({ resource, query, baseUrl, onQueryChange, paginated }) => {
    const { index: { component: listComponent = null, ...listProps } = {}, filters = null } =
        resource;
    const { background: theme = null } = usePanneauColorScheme();
    const ListComponents = useListsComponents();
    const { page = 1 } = query || {};
    const itemsProps = useResourceItems(resource, query, paginated ? parseInt(page, 10) : null);
    const onListQueryChange = useCallback(
        (newQuery) => {
            if (onQueryChange !== null) {
                onQueryChange(newQuery);
            }
        },
        [onQueryChange],
    );
    const ListComponent = getComponentFromName(listComponent || 'table', ListComponents);

    return (
        <>
            {filters !== null ? (
                <ResourceFilters
                    filters={filters}
                    value={query}
                    onChange={onQueryChange}
                />
            ) : null}
            {ListComponent !== null ? (
                <ListComponent
                    {...itemsProps}
                    {...listProps}
                    page={paginated ? parseInt(page, 10) : null}
                    baseUrl={baseUrl}
                    resource={resource}
                    query={query}
                    onQueryChange={onListQueryChange}
                    theme={theme}
                />
            ) : null}
        </>
    );
};

ResourceItemsList.propTypes = propTypes;
ResourceItemsList.defaultProps = defaultProps;

export default ResourceItemsList;
