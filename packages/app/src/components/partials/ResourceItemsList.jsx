/* eslint-disable react/jsx-props-no-spreading */
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useListsComponents, usePanneauColorScheme } from '@panneau/core/contexts';
import { getComponentFromName } from '@panneau/core/utils';
import { useResourceItems } from '@panneau/data';
import Pagination from '@panneau/element-pagination';
import PropTypes from 'prop-types';
import React from 'react';
import ResourceFilters from './ResourceFilters';

const propTypes = {
    resource: PanneauPropTypes.resource.isRequired,
    query: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    paginated: PropTypes.bool,
    baseUrl: PropTypes.string,
    component: PropTypes.oneOfType([PropTypes.elementType, PropTypes.string]),
    componentProps: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    onQueryChange: PropTypes.func,
    onQueryReset: PropTypes.func,
};

const defaultProps = {
    query: null,
    paginated: true,
    component: null,
    baseUrl: null,
    componentProps: null,
    onQueryChange: null,
    onQueryReset: null,
};

const ResourceItemsList = ({
    resource,
    query,
    baseUrl,
    onQueryChange,
    onQueryReset,
    paginated,
}) => {
    const {
        index: {
            component: listComponent = null,
            showPagination = true,
            filters = [],
            ...listProps
        } = {},
    } = resource;
    const { background: theme = null } = usePanneauColorScheme();
    const ListComponents = useListsComponents();
    const { page = 1 } = query || {};
    const itemsProps = useResourceItems(resource, query, paginated ? parseInt(page, 10) : null);
    const { lastPage = 0, total = 0 } = itemsProps || {};
    const ListComponent = getComponentFromName(listComponent || 'table', ListComponents);
    const Paginator = (
        <Pagination
            page={page}
            lastPage={lastPage}
            total={total}
            url={baseUrl}
            query={query}
            className="mt-1 mb-1"
        />
    );
    return (
        <>
            {filters !== null ? (
                <ResourceFilters
                    filters={filters}
                    value={query}
                    onChange={onQueryChange}
                    onReset={onQueryReset}
                />
            ) : null}
            {paginated && showPagination && lastPage > 1 ? Paginator : null}
            {ListComponent !== null ? (
                <ListComponent
                    {...itemsProps}
                    {...listProps}
                    page={paginated ? parseInt(page, 10) : null}
                    baseUrl={baseUrl}
                    resource={resource}
                    query={query}
                    onQueryChange={onQueryChange}
                    onQueryReset={onQueryReset}
                    theme={theme}
                    Paginator={Paginator}
                />
            ) : null}
            {paginated && showPagination && lastPage > 1 ? Paginator : null}
        </>
    );
};

ResourceItemsList.propTypes = propTypes;
ResourceItemsList.defaultProps = defaultProps;

export default ResourceItemsList;
