/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useListsComponents, usePanneauResource } from '@panneau/core/contexts';
import { getComponentFromName } from '@panneau/core/utils';
import { useResourceItems } from '@panneau/data';
import Pagination from '@panneau/element-pagination';
import Filters from '@panneau/filter-filters';

const propTypes = {
    resource: PanneauPropTypes.resource.isRequired,
    query: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    paginated: PropTypes.bool,
    baseUrl: PropTypes.string,
    component: PropTypes.oneOfType([PropTypes.elementType, PropTypes.string]),
    componentProps: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    onQueryChange: PropTypes.func,
    onQueryReset: PropTypes.func,
    onPageChange: PropTypes.func,
    showFilters: PropTypes.bool,
    listProps: PropTypes.shape({}),
    theme: PropTypes.string,
    className: PropTypes.string,
};

const defaultProps = {
    query: null,
    paginated: true,
    component: null,
    baseUrl: null,
    componentProps: null,
    onQueryChange: null,
    onQueryReset: null,
    onPageChange: null,
    showFilters: true,
    listProps: null,
    theme: null,
    className: null,
};

const ResourceItemsList = ({
    resource: resourceId,
    query,
    baseUrl,
    onQueryChange,
    onQueryReset,
    onPageChange,
    paginated,
    showFilters,
    listProps: customListProps,
    theme,
    className,
}) => {
    const resource = usePanneauResource(resourceId);

    const {
        index: {
            component: listComponent = null,
            showPagination = true,
            filters = null,
            actions = null, // eslint-disable-line no-unused-vars
            ...listProps
        } = {},
    } = resource;

    const [page, queryWithoutPage] = useMemo(() => {
        const { page: currentPage = 1, ...rest } = query || {};
        return [currentPage, rest];
    }, [query]);

    const itemsProps = useResourceItems(
        resource,
        queryWithoutPage,
        paginated ? parseInt(page, 10) : null,
    );

    const { loaded = false, loading = false, lastPage = 0, total = 0 } = itemsProps || {};
    const finalEmpty = loaded && !loading && total === 0;

    const ListComponents = useListsComponents();
    const ListComponent = getComponentFromName(listComponent || 'table', ListComponents);

    console.log('bu', baseUrl);

    return (
        <div className={className}>
            {showFilters && filters !== null ? (
                <Filters
                    filters={filters}
                    value={query}
                    onChange={onQueryChange}
                    onReset={onQueryReset}
                    theme={theme}
                />
            ) : null}
            {paginated && showPagination ? (
                <Pagination
                    page={page}
                    lastPage={lastPage}
                    total={total}
                    url={baseUrl}
                    query={query}
                    onClickPage={onPageChange}
                    className="mt-1 mb-1"
                    theme={theme}
                />
            ) : null}
            {ListComponent !== null ? (
                <ListComponent
                    {...itemsProps}
                    {...listProps}
                    resource={resource}
                    baseUrl={baseUrl}
                    theme={theme}
                    query={query}
                    onQueryChange={onQueryChange}
                    onQueryReset={onQueryReset}
                    showEmptyLabel={finalEmpty}
                    emptyLabel={
                        <p className="my-2">
                            <FormattedMessage
                                defaultMessage="No results found"
                                description="Table label"
                            />
                        </p>
                    }
                    {...customListProps}
                />
            ) : null}
            {paginated && showPagination ? (
                <Pagination
                    page={page}
                    lastPage={lastPage}
                    total={total}
                    url={baseUrl}
                    query={query}
                    onClickPage={onPageChange}
                    className="mt-4 mb-1"
                    theme={theme}
                />
            ) : null}
        </div>
    );
};

ResourceItemsList.propTypes = propTypes;
ResourceItemsList.defaultProps = defaultProps;

export default ResourceItemsList;
