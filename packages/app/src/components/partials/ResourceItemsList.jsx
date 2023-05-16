/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useListsComponents, usePanneauColorScheme } from '@panneau/core/contexts';
import { getComponentFromName } from '@panneau/core/utils';
import { useResourceItems } from '@panneau/data';
import Pagination from '@panneau/element-pagination';

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
    onClickPage: PropTypes.func,
    showFilters: PropTypes.bool,
    listProps: PropTypes.shape({}),
};

const defaultProps = {
    query: null,
    paginated: true,
    component: null,
    baseUrl: null,
    componentProps: null,
    onQueryChange: null,
    onQueryReset: null,
    onClickPage: null,
    showFilters: true,
    listProps: null,
};

const ResourceItemsList = ({
    resource,
    query,
    baseUrl,
    onQueryChange,
    onQueryReset,
    onClickPage,
    paginated,
    showFilters,
    listProps: customListProps,
}) => {
    const {
        index: {
            component: listComponent = null,
            showPagination = true,
            filters = null,
            actions = null, // eslint-disable-line no-unused-vars
            ...listProps
        } = {},
    } = resource;

    const { background: theme = null } = usePanneauColorScheme();
    const ListComponents = useListsComponents();

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

    const ListComponent = getComponentFromName(listComponent || 'table', ListComponents);

    return (
        <>
            {showFilters && filters !== null ? (
                <ResourceFilters
                    filters={filters}
                    value={query}
                    onChange={onQueryChange}
                    onReset={onQueryReset}
                />
            ) : null}
            {paginated && showPagination ? (
                <Pagination
                    page={page}
                    lastPage={lastPage}
                    total={total}
                    url={baseUrl}
                    query={query}
                    onClickPage={onClickPage}
                    className="mt-1 mb-1"
                />
            ) : null}
            {ListComponent !== null ? (
                <ListComponent
                    {...itemsProps}
                    {...listProps}
                    resource={resource}
                    baseUrl={baseUrl}
                    query={query}
                    onQueryChange={onQueryChange}
                    onQueryReset={onQueryReset}
                    theme={theme}
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
                    onClickPage={onClickPage}
                    className="mt-4 mb-1"
                />
            ) : null}
        </>
    );
};

ResourceItemsList.propTypes = propTypes;
ResourceItemsList.defaultProps = defaultProps;

export default ResourceItemsList;
