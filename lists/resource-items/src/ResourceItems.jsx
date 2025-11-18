/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import isObject from 'lodash-es/isObject';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import Actions from '@panneau/action-actions';
import { useListsComponents, usePanneauResource } from '@panneau/core/contexts';
import { useResourceUrlGenerator } from '@panneau/core/hooks';
import { getComponentFromName } from '@panneau/core/utils';
import { useResourceItems } from '@panneau/data';
import Pagination from '@panneau/element-pagination';
import Filters from '@panneau/filter-filters';

const propTypes = {
    resource: PropTypes.oneOfType([PropTypes.string.isRequired, PropTypes.shape({})]).isRequired,
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
    selectedItems: PropTypes.arrayOf(PropTypes.shape({})),
    onSelectionChange: PropTypes.func,
    multipleSelection: PropTypes.bool,
    listProps: PropTypes.shape({}),
    theme: PropTypes.string,
    className: PropTypes.string,
};

const DEFAULT_INDEX = {};
const DEFAULT_ITEMS = [];

function ResourceItemsList({
    resource: providedResource,
    query = null,
    baseUrl = null,
    onQueryChange = null,
    onQueryReset = null,
    onPageChange = null,
    paginated = true,
    showFilters = true,
    showActions = true,
    selectable = false,
    selectedItems: initialSelectedItems = null,
    onSelectionChange: parentOnChangeSelection = null,
    multipleSelection = false,
    listProps: customListProps = null,
    theme = null,
    className = null
}) {
    const panneauResource = usePanneauResource(providedResource);
    const resource = isObject(providedResource) ? providedResource : panneauResource;

    const {
        id: resourceId = null,
        index: {
            component: listComponent = null,
            showPagination = true,
            filters = null,
            actions = null,
            batchActions = null,
            actionsProps = null,
            ...listProps
        } = DEFAULT_INDEX,
    } = resource;

    const resourceUrlGenerator = useResourceUrlGenerator(
        isObject(providedResource) ? resourceId : providedResource,
    );

    const [page, queryWithoutPage] = useMemo(() => {
        const { page: currentPage = 1, ...rest } = query || {};
        return [currentPage, rest];
    }, [query]);

    const {
        items = DEFAULT_ITEMS,
        loaded = false,
        loading = false,
        pagination = null,
        updateItem = null,
        reload = null,
        pages = null,
    } = useResourceItems(resource, queryWithoutPage, paginated ? parseInt(page, 10) : null);

    const { lastPage = 0, total = 0 } = pagination || {};

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
    const finalMultipleSelection = withMultipleActions || multipleSelection;

    const [selectedItems, setSelectedItems] = useState(initialSelectedItems || null);
    const onSelectionChange = useCallback(
        (newSelection) => {
            setSelectedItems(newSelection);
        },
        [setSelectedItems],
    );
    useEffect(() => {
        if (parentOnChangeSelection !== null) {
            parentOnChangeSelection(selectedItems);
        }
    }, [selectedItems, parentOnChangeSelection]);

    const onActionsChange = useCallback(() => {
        if (reload !== null) {
            reload();
        }
    }, [reload]);

    const clearSelectedItems = useCallback(() => {
        setSelectedItems([]);
    }, [setSelectedItems]);

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
                        className="mt-1 mb-2"
                        actions={batchActions}
                        value={selectedItems}
                        onChange={onActionsChange}
                        onConfirmed={clearSelectedItems}
                        withConfirmation
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
                        loading={loading && pages !== null}
                        loaded={loaded}
                        withPreviousNext
                        selectable={finalSelectable}
                        selectedItems={selectedItems}
                        onSelectionChange={onSelectionChange}
                        multipleSelection={finalMultipleSelection}
                    />
                ) : null}
            </div>
            {ListComponent !== null ? (
                <ListComponent
                    {...listProps}
                    items={items}
                    actionsProps={{
                        resource,
                        actions,
                        reload,
                        updateItem,
                        urlGenerator: resourceUrlGenerator,
                        ...actionsProps,
                    }}
                    selectable={finalSelectable}
                    selectedItems={selectedItems}
                    onSelectionChange={onSelectionChange}
                    multipleSelection={finalMultipleSelection}
                    resource={resource}
                    baseUrl={baseUrl}
                    theme={theme}
                    query={query}
                    onQueryChange={onQueryChange}
                    onQueryReset={onQueryReset}
                    loading={loading}
                    loaded={loaded}
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
                    loading={loading && pages !== null}
                    loaded={loaded}
                    withPreviousNext
                    selectable={finalSelectable}
                    selectedItems={selectedItems}
                    onSelectionChange={onSelectionChange}
                    multipleSelection={finalMultipleSelection}
                />
            ) : null}
        </div>
    );
}

ResourceItemsList.propTypes = propTypes;

export default ResourceItemsList;
