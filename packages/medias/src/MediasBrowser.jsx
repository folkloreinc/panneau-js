/* eslint-disable react/jsx-props-no-spreading, react/no-array-index-key */
import classNames from 'classnames';
import isArray from 'lodash-es/isArray';
import uniqBy from 'lodash-es/uniqBy';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useQuery } from '@panneau/core/hooks';
import Buttons from '@panneau/element-buttons';
import Grid from '@panneau/element-grid';
import Icon from '@panneau/element-icon';
import MediaCard from '@panneau/element-media-card';
import Pagination from '@panneau/element-pagination';
import Table from '@panneau/element-table';
import UploadField from '@panneau/field-upload';
import Filters from '@panneau/filter-filters';

import { useMediaDelete, useMediaTrash, useMedias } from './hooks';
import useMediaRestore from './hooks/useMediaRestore';

import { useCurrentMedia } from './MediaContext';
import MediaForm from './MediaForm';
import defaultColumns from './defaults/columns';
import defaultFields from './defaults/fields';
import defaultFilters from './defaults/filters';

const propTypes = {
    items: PanneauPropTypes.medias,
    extraItems: PanneauPropTypes.medias,
    types: PropTypes.arrayOf(PropTypes.string),
    permissions: PropTypes.shape({
        create: PropTypes.bool,
        edit: PropTypes.bool,
        delete: PropTypes.bool,
    }),
    filters: PanneauPropTypes.filters,
    columns: PanneauPropTypes.tableColumns,
    query: PropTypes.shape({}),
    baseUrl: PropTypes.string,
    fields: PanneauPropTypes.fields,
    layout: PropTypes.string,
    layouts: PropTypes.arrayOf(PropTypes.shape({})),
    theme: PropTypes.string,
    onMediaUploaded: PropTypes.func,
    onItemsChange: PropTypes.func,
    onLayoutChange: PropTypes.func,
    onMediaFormOpen: PropTypes.func,
    onMediaFormClose: PropTypes.func,
    selectable: PropTypes.bool,
    selectedItems: PropTypes.oneOfType([
        PropTypes.shape({}),
        PropTypes.arrayOf(PropTypes.shape({})),
    ]),
    onSelectionChange: PropTypes.func,
    multipleSelection: PropTypes.bool,
    uppyConfig: PropTypes.shape({}),
    withDelete: PropTypes.bool,
    withTrash: PropTypes.bool,
    withReplace: PropTypes.bool,
    withStickySelection: PropTypes.bool,
    withoutUpload: PropTypes.bool,
    className: PropTypes.string,
    formChildren: PropTypes.node,
};

const defaultProps = {
    items: null,
    extraItems: null,
    types: null,
    permissions: null,
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
    onMediaUploaded: null,
    onItemsChange: null,
    onLayoutChange: null,
    onMediaFormOpen: null,
    onMediaFormClose: null,
    selectable: false,
    selectedItems: null,
    onSelectionChange: null,
    multipleSelection: false,
    uppyConfig: null,
    withDelete: false,
    withTrash: false,
    withReplace: false,
    withStickySelection: false,
    withoutUpload: false,
    className: null,
    formChildren: null,
};

function MediasBrowser({
    items: initialItems,
    extraItems,
    types,
    permissions,
    baseUrl,
    filters,
    columns,
    fields,
    query: initialQuery,
    layout: initialLayout,
    layouts,
    theme,
    onMediaUploaded,
    onItemsChange,
    onLayoutChange,
    onMediaFormOpen,
    onMediaFormClose,
    selectable,
    selectedItems,
    onSelectionChange,
    multipleSelection,
    uppyConfig,
    withDelete,
    withTrash,
    withReplace,
    withStickySelection,
    withoutUpload,
    className,
    formChildren,
}) {
    const [baseItems] = useState(initialItems || null);
    const baseQuery = useMemo(
        () => ({ count: 12, ...initialQuery, ...(types !== null ? { types } : null) }),
        [initialQuery, types],
    );
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

    const {
        create: canCreate = true,
        edit: canEdit = true,
        delete: canDelete = true,
    } = permissions || {};

    const canUpload = canCreate && !withoutUpload;

    // eslint-disable-next-line no-unused-vars
    const { types: queryTypes = null, trashed = null, ...queryWithoutTypes } = query || {};

    const { mediaTrash, trashing } = useMediaTrash();
    const { mediaDelete, deleting } = useMediaDelete();
    const { mediaRestore } = useMediaRestore();

    const [showTrashed, setShowTrashed] = useState(false);

    const {
        items,
        allItems,
        loading = false,
        loaded = false,
        updateItem = null,
        pagination: { lastPage, total } = {},
        pages = null,
        reload,
    } = useMedias(query, page, count, {
        items: baseItems,
        trashed: showTrashed,
        queryConfig: { staleTime: 0 },
    });

    const onClickTrash = useCallback(() => {
        setShowTrashed(!showTrashed);
    }, [showTrashed, setShowTrashed]);

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

    const { currentMedia, setCurrentMedia } = useCurrentMedia();

    useEffect(() => {
        if (currentMedia !== null && onMediaFormOpen !== null) {
            onMediaFormOpen();
        }
        if (currentMedia === null && onMediaFormClose !== null) {
            onMediaFormClose();
        }
    }, [currentMedia]);

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

    const onReplaceMedia = useCallback(
        (item) => {
            setCurrentMedia(item);
            reload();
        },
        [setCurrentMedia],
    );

    const onDeleteMedia = useCallback(() => {
        if (reload !== null) {
            reload();
        }
    }, [reload]);

    const onTrashMedia = useCallback(
        (id) =>
            !showTrashed && withTrash
                ? mediaTrash(id)
                      .then(() => {
                          if (!multipleSelection) {
                              const { id: selectedId = null } = selectedItems || {};
                              if (selectedId !== null && selectedId === id) {
                                  onSelectionChange(null);
                              }
                          }
                          // Todo remove from mult selection
                      })
                      .then(reload)
                : mediaDelete(id)
                      .then(() => {
                          if (!multipleSelection) {
                              const { id: selectedId = null } = selectedItems || {};
                              if (selectedId !== null && selectedId === id) {
                                  onSelectionChange(null);
                              }
                          }
                          // Todo remove from selection
                      })
                      .then(reload),
        [
            showTrashed,
            withTrash,
            mediaTrash,
            mediaDelete,
            reload,
            selectedItems,
            multipleSelection,
            onSelectionChange,
        ],
    );

    const [uploadedMedias, setUploadedMedias] = useState(null);
    const [uploadProcessing, setUploadProcessing] = useState(false);

    const onUploadedMediaChanged = useCallback(
        (newMedias) => {
            const uploadedNewMedias = (
                isArray(newMedias)
                    ? [...newMedias, ...(uploadedMedias || [])]
                    : [newMedias, ...(uploadedMedias || [])]
            ).filter((it) => it !== null);
            setUploadedMedias(uploadedNewMedias);
            if (onSelectionChange !== null) {
                const [firstMedia = null] = newMedias || [];
                onSelectionChange(multipleSelection && isArray(newMedias) ? newMedias : firstMedia);
                onQueryReset();
                reload().then(() => {
                    setUploadedMedias(null);
                });
            }
        },
        [
            onSelectionChange,
            setUploadedMedias,
            uploadedMedias,
            onQueryReset,
            reload,
            multipleSelection,
        ],
    );

    const onUploadComplete = useCallback(
        (medias = null) => {
            if (showTrashed) {
                setShowTrashed(false);
            }

            if (medias === null) return;

            const rawMedias = (isArray(medias) ? medias : [medias]).filter((it) => it !== null);
            if (onMediaUploaded !== null) {
                setUploadProcessing(true);
                onMediaUploaded(rawMedias)
                    .then((newMedias) => {
                        onUploadedMediaChanged(newMedias);
                        setUploadProcessing(false);
                    })
                    .catch(() => {
                        setUploadProcessing(false);
                    });
            } else {
                onUploadedMediaChanged(rawMedias);
            }
        },
        [onMediaUploaded, setUploadedMedias, setUploadProcessing, onUploadedMediaChanged],
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
            loading={loading && pages !== null}
            selectable={selectable}
            selectedItems={selectedItems}
            onSelectionChange={onSelectionChange}
            multipleSelection={multipleSelection}
            withPreviousNext
            alwaysShowButtons
        />
    );

    const hidePagination = loaded && !loading && (items || []).length === 0;

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
                      disabled: uploadProcessing,
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
    }, [filters, types, withTrash, showTrashed, uploadProcessing, onClickTrash]);

    const partialColumns = useMemo(
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
                      if (columnId === 'actions') {
                          const { actions = [] } = column || {};
                          return {
                              ...column,
                              actions: (actions || [])
                                  .reduce((acc, action) => {
                                      if (action === 'delete') {
                                          acc.push({
                                              id: 'restore',
                                              component: 'restore',
                                              withConfirmation: true,
                                              action: (ids) => mediaRestore(ids[0]).then(reload),
                                          });
                                      }
                                      acc.push(action);
                                      return acc;
                                  }, [])
                                  .filter((it) => it !== 'edit'),
                          };
                      }
                      return column;
                  })
                : columns,
        [columns, withTrash, showTrashed],
    );

    const finalColumns = useMemo(
        () =>
            (partialColumns || [])
                .map((column) => {
                    const { id: columnId = null } = column || {};
                    if (columnId === 'actions') {
                        const { actions = [] } = column || {};
                        const availableActions = actions
                            .filter((act) => act !== 'delete' || canDelete)
                            .filter((act) => act !== 'edit' || canEdit);
                        if (availableActions.length === 0) {
                            return null;
                        }
                        return {
                            ...column,
                            actions: availableActions,
                        };
                    }
                    return column;
                })
                .filter((act) => act !== null),
        [partialColumns, canEdit, canDelete],
    );

    const hasQueryItem = useMemo(() => {
        const showOnTopQuery = types === null ? query : queryWithoutTypes;
        return showOnTopQuery !== null && !trashed ? Object.keys(showOnTopQuery).length > 0 : false;
    }, [types, query, queryWithoutTypes, trashed]);

    const finalItems = useMemo(() => {
        if (
            withStickySelection &&
            (extraItems !== null || uploadedMedias !== null || uploadProcessing === true)
        ) {
            return uniqBy(
                [
                    ...(uploadProcessing
                        ? [
                              {
                                  id: '-',
                                  loading: true,
                                  actionsDisabled: true,
                                  selectionDisabled: true,
                              },
                          ]
                        : []),
                    ...(page === 1 && !hasQueryItem ? uploadedMedias || [] : []),
                    ...(page === 1 && !hasQueryItem && !showTrashed
                        ? (extraItems || [])
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
                              .filter((it) => it !== null) || []
                        : []),

                    ...(items || []),
                ],
                (it) => it?.id,
            );
        }
        return items;
    }, [
        items,
        page,
        allItems,
        withStickySelection,
        extraItems,
        uploadProcessing,
        hasQueryItem,
        showTrashed,
    ]);

    // const emptyWithSticky = useMemo(
    //     () => (items || []).length === 0 && (finalItems || []).length > 0,
    //     [items, finalItems],
    // );

    return (
        <div className={className}>
            {currentMedia !== null ? (
                <MediaForm
                    value={currentMedia}
                    fields={fields}
                    onChange={setCurrentMedia}
                    onSave={onSaveMedia}
                    onReplace={onReplaceMedia}
                    onClose={onCloseMedia}
                    onDelete={onDeleteMedia}
                    withDelete={withDelete}
                    withTrash={withTrash}
                    withReplace={withReplace}
                >
                    {formChildren}
                </MediaForm>
            ) : (
                <>
                    <div className={classNames(['d-flex', 'justify-content-between'])}>
                        {filters !== null ? (
                            <Filters
                                value={query}
                                clearValue={types !== null ? queryWithoutTypes : null}
                                filters={finalFilters}
                                onChange={onQueryChange}
                                onReset={onQueryReset}
                                theme={theme}
                            />
                        ) : null}
                        {/* make this actions someday ? */}
                        {canUpload ? (
                            <UploadField
                                className="ms-auto w-auto text-nowrap mt-2 mb-2 ps-2"
                                withButton
                                withoutMedia
                                uppyProps={uppyConfig}
                                types={types}
                                allowMultipleUploads
                                onChange={onUploadComplete}
                                disabled={uploadProcessing}
                                loading={uploadProcessing}
                                outline={false}
                                closeAfterFinish
                            />
                        ) : null}
                    </div>
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
                                theme="secondary"
                                outline
                                items={(layouts || []).map((lay) => ({
                                    ...lay,
                                    active: layout === lay.id,
                                    onClick: () => onClickLayout(lay.id),
                                    className: 'px-3 py-2',
                                }))}
                            />
                        ) : null}
                        {!hidePagination ? pagination : <div />}
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
                            selectable={selectable && !showTrashed}
                            selectedItems={selectedItems}
                            onSelectionChange={uploadProcessing ? null : onSelectionChange}
                            multipleSelection={multipleSelection}
                            query={query} // For sort
                            onQueryChange={onQueryChange}
                            items={finalItems || []}
                            loading={loading}
                            loaded={loaded}
                            // empty={emptyWithSticky}
                        />
                    ) : null}
                    {layout === 'table' ? (
                        <Table
                            theme={theme}
                            columns={finalColumns}
                            displayPlaceholder={
                                <span className="text-secondary text-opacity-75">—</span>
                            }
                            selectable={selectable && !showTrashed}
                            selectedItems={selectedItems}
                            onSelectionChange={uploadProcessing ? null : onSelectionChange}
                            multipleSelection={multipleSelection}
                            query={query} // For sort
                            onQueryChange={onQueryChange}
                            items={finalItems}
                            loading={loading}
                            loaded={loaded}
                            // empty={emptyWithSticky}
                            actionsProps={{
                                getDeletePropsFromItem: () => ({
                                    href: null,
                                    withConfirmation: true,
                                    disabled: trashing || deleting,
                                    icon: showTrashed ? 'trash-fill' : 'trash',
                                    action: (ids) => onTrashMedia(ids[0]),
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
                    {!hidePagination ? (
                        <div
                            className={classNames([
                                'd-flex',
                                'mt-3',
                                'mb-1',
                                'justify-content-end',
                            ])}
                        >
                            {pagination}
                        </div>
                    ) : null}
                </>
            )}
        </div>
    );
}

MediasBrowser.propTypes = propTypes;
MediasBrowser.defaultProps = defaultProps;

export default MediasBrowser;
