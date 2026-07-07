import classNames from 'classnames';
import isObject from 'lodash-es/isObject';
import type { ComponentType } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import Actions from '@panneau/action-actions';
import type { Item, Resource } from '@panneau/core';
import { useListsComponents, usePanneauResource } from '@panneau/core/contexts';
// import { useResourceUrlGenerator } from '@panneau/core/hooks';
import { getComponentFromName } from '@panneau/core/utils';
import { useResourceItems } from '@panneau/data';
import Pagination from '@panneau/element-pagination';
import Filters from '@panneau/filter-filters';

interface ResourceItemsListProps {
    resource: string | Resource;
    query?: Record<string, unknown> | null;
    paginated?: boolean;
    baseUrl?: string | null;
    component?: ComponentType | string | null;
    componentProps?: Record<string, unknown> | null;
    onQueryChange?: ((query: Record<string, unknown>) => void) | null;
    onQueryReset?: (() => void) | null;
    onPageChange?: ((page: number) => void) | null;
    showFilters?: boolean;
    showActions?: boolean;
    selectable?: boolean;
    selectedItems?: Item[] | null;
    onSelectionChange?: ((items: Item[]) => void) | null;
    multipleSelection?: boolean;
    listProps?: Record<string, unknown> | null;
    actionsProps?: Record<string, unknown> | null;
    theme?: string | null;
    className?: string | null;
}

const DEFAULT_INDEX = {};
const DEFAULT_ITEMS: Item[] = [];

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
    actionsProps: customActionProps = null,
    theme = null,
    className = null,
}: ResourceItemsListProps) {
    const resource = usePanneauResource(providedResource);

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
    } = resource || {};

    // const resourceUrlGenerator = useResourceUrlGenerator(
    //     isObject(providedResource) ? resourceId : providedResource,
    // );

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
    } = useResourceItems(resource, queryWithoutPage, paginated ? parseInt(String(page), 10) : null);

    const { lastPage = 0, total = 0 } = pagination || {};

    const ListComponents = useListsComponents();
    const ListComponent = getComponentFromName(listComponent || 'table', ListComponents);

    const withFilters = showFilters && filters !== null;
    const withActions = showActions && batchActions !== null && batchActions.length > 0;

    const finalSelectable = selectable || withActions;
    const withMultipleActions =
        withActions &&
        (batchActions as { multiple?: boolean }[]).reduce((acc, it) => {
            const { multiple = false } = it || {};
            if (multiple) {
                return true;
            }
            return acc;
        }, false);
    const finalMultipleSelection = withMultipleActions || multipleSelection;

    const [selectedItems, setSelectedItems] = useState<Item[] | null>(initialSelectedItems || null);
    const onSelectionChange = useCallback(
        (newSelection: Item[]) => {
            setSelectedItems(newSelection);
            if (parentOnChangeSelection !== null) {
                parentOnChangeSelection(selectedItems!);
            }
        },
        [setSelectedItems],
    );

    const onActionsChange = useCallback(() => {
        if (reload !== null) {
            reload();
        }
    }, [reload]);

    const clearSelectedItems = useCallback(() => {
        const newSelectedItems = [];
        setSelectedItems(newSelectedItems);
        if (parentOnChangeSelection !== null) {
            parentOnChangeSelection(newSelectedItems);
        }
    }, [setSelectedItems]);

    const finalActionProps = {
        ...customActionProps,
        ...actionsProps,
    };

    return (
        <div className={className!}>
            {withFilters ? (
                <Filters
                    filters={filters}
                    value={query}
                    onChange={onQueryChange}
                    onClear={onQueryReset}
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
                        updateValue: updateItem,
                        ...finalActionProps,
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

export default ResourceItemsList;
