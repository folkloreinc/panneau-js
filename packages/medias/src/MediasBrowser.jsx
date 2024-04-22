/* eslint-disable react/jsx-props-no-spreading, react/no-array-index-key */
import classNames from 'classnames';
import uniqBy from 'lodash/uniqBy';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useQuery } from '@panneau/core/hooks';
import Button from '@panneau/element-button';
import Buttons from '@panneau/element-buttons';
import Grid from '@panneau/element-grid';
import Icon from '@panneau/element-icon';
import MediaCard from '@panneau/element-media-card';
import Pagination from '@panneau/element-pagination';
import Table from '@panneau/element-table';
import Filters from '@panneau/filter-filters';

import { useMediaDelete, useMediaTrash, useMedias } from './hooks';

import MediaForm from './MediaForm';
import { useMediasForm } from './MediasFormContext';
import defaultColumns from './defaults/columns';
import defaultFields from './defaults/fields';
import defaultFilters from './defaults/filters';

import styles from './styles.module.scss';

const propTypes = {
    items: PanneauPropTypes.medias,
    extraItems: PanneauPropTypes.medias,
    types: PropTypes.arrayOf(PropTypes.string),
    buttons: PanneauPropTypes.buttons,
    filters: PanneauPropTypes.filters,
    columns: PanneauPropTypes.tableColumns,
    query: PropTypes.shape({}),
    baseUrl: PropTypes.string,
    fields: PanneauPropTypes.fields,
    layout: PropTypes.string,
    layouts: PropTypes.arrayOf(PropTypes.shape({})),
    theme: PropTypes.string,
    tableProps: PropTypes.bool,
    onItemsChange: PropTypes.func,
    onLayoutChange: PropTypes.func,
    selectedCount: PropTypes.number,
    onClearSelected: PropTypes.func,
    withTrash: PropTypes.bool,
    withStickySelection: PropTypes.bool,
    className: PropTypes.string,
    buttonsClassName: PropTypes.string,
    formChildren: PropTypes.node,
};

const defaultProps = {
    items: null,
    extraItems: null,
    types: null,
    buttons: null,
    filters: defaultFilters,
    columns: defaultColumns,
    fields: defaultFields,
    query: null,
    baseUrl: null,
    layout: 'table',
    layouts: [
        {
            id: 'table',
            label: <Icon name="table" />,
        },
        {
            id: 'grid',
            label: <Icon name="grid" />,
        },
    ],
    theme: null,
    tableProps: null,
    onItemsChange: null,
    onLayoutChange: null,
    selectedCount: null,
    onClearSelected: null,
    withTrash: false,
    withStickySelection: false,
    className: null,
    buttonsClassName: null,
    formChildren: null,
};

function MediasBrowser({
    items: initialItems,
    extraItems,
    types,
    baseUrl,
    buttons,
    filters,
    columns,
    fields,
    query: initialQuery,
    layout: initialLayout,
    layouts,
    theme,
    tableProps,
    onItemsChange,
    onLayoutChange,
    selectedCount,
    onClearSelected,
    withTrash,
    withStickySelection,
    className,
    buttonsClassName,
    formChildren,
}) {
    const [baseItems] = useState(initialItems || null);
    const baseQuery = useMemo(() => ({ count: 12, ...initialQuery, types }), [initialQuery, types]);
    const { query: fullQuery, onPageChange, onQueryChange, onQueryReset } = useQuery(baseQuery);

    const {
        page = null,
        count = null,
        query = null,
    } = useMemo(() => {
        const {
            page: fullQueryPage = null,
            count: fullQueryCount = null,
            ...params
        } = fullQuery || {};
        return {
            page: fullQueryPage,
            count: fullQueryCount,
            query: params,
        };
    }, [fullQuery]);

    // eslint-disable-next-line no-unused-vars
    const { types: queryTypes = null, trashed = null, ...queryWithoutTypes } = query || {};

    const { mediaTrash, trashing } = useMediaTrash();
    const { mediaDelete, deleting } = useMediaDelete();

    const [showTrashed, setShowTrashed] = useState(false);
    const onClickTrash = useCallback(() => {
        setShowTrashed(!showTrashed);
    }, [showTrashed, setShowTrashed]);

    const {
        items,
        allItems,
        loading = false,
        updateItem = null,
        pagination: { lastPage, total } = {},
    } = useMedias(query, page, count, { items: baseItems, trashed: showTrashed });

    // For picker
    useEffect(() => {
        if (onItemsChange !== null) {
            onItemsChange(items);
        }
    }, [items, onItemsChange]);

    const [layout, setLayout] = useState(initialLayout || 'table');
    const hasLayouts = useMemo(() => layouts !== null && layouts.length > 1, [layouts]);
    const onClickLayout = useCallback(
        (newLayout) => {
            setLayout(newLayout);
            if (onLayoutChange !== null) {
                onLayoutChange(newLayout);
            }
        },
        [setLayout],
    );

    // const [currentMedia, setCurrentMedia] = useState(null);
    const { media: currentMedia, setMedia: setCurrentMedia } = useMediasForm();

    const onOpenMedia = useCallback(
        (media) => {
            setCurrentMedia(media);
        },
        [setCurrentMedia],
    );

    const onCloseMedia = useCallback(() => {
        setCurrentMedia(null);
    }, [setCurrentMedia]);

    const onSaveMedia = useCallback(
        (item) => {
            setCurrentMedia(null);
            updateItem(item);
        },
        [setCurrentMedia, updateItem],
    );

    const pagination = (
        <Pagination
            page={page}
            lastPage={lastPage}
            total={total}
            url={baseUrl}
            query={query}
            onClickPage={onPageChange}
            theme={theme}
            loading={loading}
            selectedCount={selectedCount}
            onClearSelected={onClearSelected}
            withPreviousNext
            alwaysShowButtons
        />
    );

    const finalFilters = useMemo(() => {
        const partialFilters = withTrash
            ? (filters || []).concat([
                  {
                      name: 'trashed',
                      component: 'button',
                      theme: showTrashed ? 'danger' : 'secondary',
                      outline: !showTrashed,
                      activeTheme: 'danger',
                      icon: showTrashed ? 'trash-fill' : 'trash',
                      onClick: onClickTrash,
                  },
              ])
            : filters;

        if (types !== null && partialFilters !== null) {
            return (partialFilters || []).map((filter) => {
                const { id = null } = filter || {};
                return id === 'types' ? { ...filter, disabled: true } : filter;
            });
        }
        return partialFilters;
    }, [filters, types, withTrash, showTrashed, onClickTrash]);

    const finalColumns = useMemo(
        () =>
            withTrash && showTrashed
                ? (columns || []).map((column) => {
                      const { id: columnId = null } = column || {};
                      if (columnId === 'created_at') {
                          return {
                              ...column,
                              path: 'deleted_at',
                              label: (
                                  <FormattedMessage
                                      defaultMessage="Deleted at"
                                      description="Column label"
                                  />
                              ),
                          };
                      }
                      return column;
                  })
                : columns,
        [columns, withTrash, showTrashed],
    );

    const finalItems = useMemo(() => {
        if (withStickySelection && extraItems !== null) {
            return uniqBy(
                [
                    ...(extraItems || [])
                        .map((item) => {
                            const { id: itemId = null } = item;
                            return (
                                (allItems || []).find(
                                    ({ id: otherId = null } = {}) => otherId === itemId,
                                ) ||
                                item ||
                                null
                            );
                        })
                        .filter((it) => it !== null),
                    ...(items || []),
                ],
                (it) => it?.id,
            );
        }
        return items;
    }, [items, page, allItems, withStickySelection, extraItems]);

    return (
        <div className={classNames([styles.container, className])}>
            {currentMedia !== null ? (
                <>
                    <div className="mt-2 mb-4">
                        <Button theme="primary" onClick={onCloseMedia} icon="arrow-left">
                            <FormattedMessage
                                defaultMessage="Back to files"
                                description="Button label"
                            />
                        </Button>
                    </div>
                    <MediaForm
                        value={currentMedia}
                        fields={fields}
                        onChange={setCurrentMedia}
                        onSave={onSaveMedia}
                        onClose={onCloseMedia}
                        withTrash={withTrash}
                    >
                        {formChildren}
                    </MediaForm>
                </>
            ) : (
                <>
                    {filters !== null ? (
                        <Filters
                            value={query}
                            clearValue={types !== null ? queryWithoutTypes : null}
                            filters={finalFilters}
                            onChange={onQueryChange}
                            onReset={onQueryReset}
                            theme={theme}
                        >
                            {buttons !== null ? (
                                <Buttons items={buttons} className={buttonsClassName} />
                            ) : null}
                        </Filters>
                    ) : null}
                    {filters === null && buttons !== null ? (
                        <div className="mt-2 mb-2">
                            <Buttons items={buttons} className={buttonsClassName} />
                        </div>
                    ) : null}
                    <div
                        className={classNames([
                            'd-flex',
                            'mt-1',
                            'mb-3',
                            {
                                'justify-content-between': hasLayouts,
                                'justify-content-end': !hasLayouts,
                            },
                        ])}
                    >
                        {hasLayouts ? (
                            <Buttons
                                size="sm"
                                theme="primary"
                                outline
                                items={(layouts || []).map((lay) => ({
                                    ...lay,
                                    active: layout === lay.id,
                                    onClick: () => onClickLayout(lay.id),
                                    className: 'px-3',
                                }))}
                            />
                        ) : null}
                        {pagination}
                    </div>
                    {layout === 'grid' ? (
                        <Grid
                            size="small"
                            theme={theme}
                            component={MediaCard}
                            componentProps={{
                                className: 'd-flex w-100',
                                cardClassName: 'flex-grow-1',
                                vertical: true,
                                onClickDescription: (it) => {
                                    onOpenMedia(it);
                                },
                            }}
                            onSelectItem={(it) => onOpenMedia(it)}
                            {...tableProps}
                            items={finalItems || []}
                            loading={loading}
                        />
                    ) : null}
                    {layout === 'table' ? (
                        <Table
                            theme={theme}
                            columns={finalColumns}
                            displayPlaceholder={
                                <span className="text-secondary text-opacity-75">—</span>
                            }
                            onSelectItem={(it) => onOpenMedia(it)}
                            {...tableProps}
                            items={finalItems}
                            loading={loading}
                            actionsProps={{
                                getDeletePropsFromItem: ({ id = null } = {}) => ({
                                    href: null,
                                    onClick: () => (showTrashed ? mediaDelete(id) : mediaTrash(id)),
                                    disabled: trashing || deleting,
                                    icon: showTrashed ? 'trash-fill' : 'trash',
                                }),
                                getEditPropsFromItem: (it) => ({
                                    href: null,
                                    onClick: () => {
                                        onOpenMedia(it);
                                    },
                                }),
                            }}
                        />
                    ) : null}
                    <div className={classNames(['d-flex', 'mt-3', 'mb-1', 'justify-content-end'])}>
                        {pagination}
                    </div>
                </>
            )}
        </div>
    );
}

MediasBrowser.propTypes = propTypes;
MediasBrowser.defaultProps = defaultProps;

export default MediasBrowser;
