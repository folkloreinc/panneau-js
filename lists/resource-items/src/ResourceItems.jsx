/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import isObject from 'lodash/isObject';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

import Actions from '@panneau/action-actions';
import { useListsComponents, usePanneauResource } from '@panneau/core/contexts';
import { useItemSelection, useResourceUrlGenerator } from '@panneau/core/hooks';
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
    onSelectionChange: PropTypes.func,
    multipleSelection: PropTypes.bool,
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
    multipleSelection: false,
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
    multipleSelection,
    listProps: customListProps,
    theme,
    className,
}) => {
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
        } = {},
    } = resource;
    const resourceUrlGenerator = useResourceUrlGenerator(
        isObject(providedResource) ? resourceId : providedResource,
    );

    const [page, queryWithoutPage] = useMemo(() => {
        const { page: currentPage = 1, ...rest } = query || {};
        return [currentPage, rest];
    }, [query]);

    const {
        items = [],
        loaded = false,
        loading = false,
        pagination = null,
        updateItem = null,
        reload = null,
    } = useResourceItems(resource, queryWithoutPage, paginated ? parseInt(page, 10) : null);

    const { lastPage = 0, total = 0 } = pagination || {};
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
    const finalMultipleSelection = withMultipleActions || multipleSelection;

    const {
        onSelectItem,
        onSelectPage,
        onClearSelected,
        pageSelected,
        selectedCount,
        selectedItems,
        setSelectedItems,
    } = useItemSelection({
        items: items || [],
        selectedItems: null,
        onSelectionChange,
        multipleSelection: finalMultipleSelection,
    });

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
                        withPreviousNext
                        selectedCount={selectedCount}
                        onClearSelected={onClearSelected}
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
                    multipleSelection={withMultipleActions || multipleSelection}
                    selectedItems={selectedItems}
                    onSelectItem={finalSelectable ? onSelectItem : null}
                    onSelectPage={finalSelectable ? onSelectPage : null}
                    pageSelected={pageSelected}
                    selectedCount={selectedCount}
                    selectedItemsCount={total}
                    resource={resource}
                    baseUrl={baseUrl}
                    theme={theme}
                    query={query}
                    onQueryChange={onQueryChange}
                    onQueryReset={onQueryReset}
                    showEmptyLabel={finalEmpty}
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
                    withPreviousNext
                    selectedCount={selectedCount}
                    onClearSelected={onClearSelected}
                />
            ) : null}
        </div>
    );
};

ResourceItemsList.propTypes = propTypes;
ResourceItemsList.defaultProps = defaultProps;

export default ResourceItemsList;
