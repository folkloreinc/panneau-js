/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import isObject from 'lodash/isObject';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import Actions from '@panneau/action-actions';
// import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useListsComponents, usePanneauResource } from '@panneau/core/contexts';
import { getComponentFromName } from '@panneau/core/utils';
import { useResourceItems } from '@panneau/data';
import Pagination from '@panneau/element-pagination';
import Filters from '@panneau/filter-filters';

const propTypes = {
    resource: PropTypes.string.isRequired,
    query: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    paginated: PropTypes.bool,
    baseUrl: PropTypes.string,
    component: PropTypes.oneOfType([PropTypes.elementType, PropTypes.string]),
    componentProps: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    onQueryChange: PropTypes.func,
    onQueryReset: PropTypes.func,
    onPageChange: PropTypes.func,
    showFilters: PropTypes.bool,
    showActions: PropTypes.bool,
    selectable: PropTypes.bool,
    onSelectionChange: PropTypes.func,
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
    showActions: true,
    selectable: false,
    onSelectionChange: null,
    listProps: null,
    theme: null,
    className: null,
};

const ResourceItemsList = ({
    resource: providedResource,
    query,
    baseUrl,
    onQueryChange,
    onQueryReset,
    onPageChange,
    paginated,
    showFilters,
    showActions,
    selectable,
    onSelectionChange,
    listProps: customListProps,
    theme,
    className,
}) => {
    const panneauResource = usePanneauResource(providedResource);
    const resource = isObject(providedResource) ? providedResource : panneauResource;

    const {
        index: {
            component: listComponent = null,
            showPagination = true,
            filters = null,
            // actions = null,
            batchActions = null,
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

    const {
        // items = [],
        loaded = false,
        loading = false,
        lastPage = 0,
        total = 0,
        reloadPage = null,
        reset = null,
    } = itemsProps || {};

    const finalEmpty = loaded && !loading && total === 0;

    const ListComponents = useListsComponents();
    const ListComponent = getComponentFromName(listComponent || 'table', ListComponents);

    const withFilters = showFilters && filters !== null;
    const withActions = showActions && batchActions !== null && batchActions.length > 0;

    const finalSelectable = selectable || withActions;
    const withMultipleActions =
        withActions &&
        batchActions.reduce((acc, it) => {
            const { multiple = false } = it || {};
            if (multiple) {
                return true;
            }
            return acc;
        }, false);

    const [selectedItems, setSelectedItems] = useState(null);
    const onSelectItems = useCallback(
        (newItems) => {
            setSelectedItems(newItems);
            if (onSelectionChange !== null) {
                onSelectionChange(newItems);
            }
        },
        [setSelectedItems, onSelectionChange],
    );

    const onActionsChange = useCallback(() => {
        if (reset !== null && reloadPage !== null) {
            reset();
            reloadPage(parseInt(page, 10));
        }
    }, [reloadPage, reset, page, setSelectedItems]);

    return (
        <div className={className}>
            {withFilters ? (
                <Filters
                    filters={filters}
                    value={query}
                    onChange={onQueryChange}
                    onReset={onQueryReset}
                    theme={theme}
                />
            ) : null}
            <div
                className={classNames([
                    'd-flex',
                    'flex-column',
                    'flex-md-row',
                    'align-items-start',
                    { 'justify-content-between': withActions, 'justify-content-end': !withActions },
                ])}
            >
                {withActions ? (
                    <Actions
                        className="mb-2"
                        actions={batchActions}
                        value={selectedItems}
                        onChange={onActionsChange}
                        setSelectedItems={setSelectedItems}
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
                        className="mt-1 mb-3"
                        theme={theme}
                        withPreviousNext
                    />
                ) : null}
            </div>
            {ListComponent !== null ? (
                <ListComponent
                    {...itemsProps}
                    {...listProps}
                    selectable={finalSelectable}
                    multiple={withMultipleActions}
                    onSelectionChange={onSelectItems}
                    selectedItems={selectedItems}
                    selectedItemsCount={total}
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
                    withPreviousNext
                />
            ) : null}
        </div>
    );
};

ResourceItemsList.propTypes = propTypes;
ResourceItemsList.defaultProps = defaultProps;

export default ResourceItemsList;
