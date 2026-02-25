/* eslint-disable react/jsx-props-no-spreading, react/no-array-index-key */
import classNames from 'classnames';
import uniqBy from 'lodash/uniqBy';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import type { Media } from '@panneau/core';
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

const DEFAULT_LAYOUTS: LayoutItem[] = [
    {
        id: 'table',
        label: <Icon name="table" />,
    },
    {
        id: 'grid',
        label: <Icon name="grid" />,
    },
];
const DEFAULT_UPPY_CONFIG = {};

type FilterItem = Record<string, unknown> & { id?: string | null };
type ColumnAction =
    | string
    | {
          id?: string;
          component?: string;
          withConfirmation?: boolean;
          action?: (ids: Array<string | number>) => Promise<unknown> | unknown;
          [key: string]: unknown;
      };
type ColumnItem = Record<string, unknown> & { id?: string | null; actions?: ColumnAction[] };
type SelectionValue = Media | Media[] | null;

interface LayoutItem {
    id: string;
    label: ReactNode;
    [key: string]: unknown;
}

interface MediasBrowserProps {
    items?: Media[] | null;
    extraItems?: Media[] | null;
    types?: string[] | null;
    permissions?: {
        create?: boolean;
        edit?: boolean;
        delete?: boolean;
    } | null;
    filters?: FilterItem[] | null;
    columns?: ColumnItem[] | null;
    query?: Record<string, unknown> | null;
    baseUrl?: string | null;
    fields?: Array<Record<string, unknown>> | null;
    layout?: string;
    layouts?: LayoutItem[] | null;
    theme?: string | null;
    onMediaUploaded?:
        | ((medias: Media[]) => Promise<Media[] | Media | null> | Media[] | Media | null)
        | null;
    onItemsChange?: ((items: Media[] | null | undefined) => void) | null;
    onLayoutChange?: ((layout: string) => void) | null;
    onMediaFormOpen?: (() => void) | null;
    onMediaFormClose?: (() => void) | null;
    selectable?: boolean;
    selectedItems?: SelectionValue;
    onSelectionChange?: ((selection: SelectionValue) => void) | null;
    multipleSelection?: boolean;
    uppyConfig?: Record<string, unknown>;
    withDelete?: boolean;
    withTrash?: boolean;
    withReplace?: boolean;
    withStickySelection?: boolean;
    withoutUpload?: boolean;
    className?: string | null;
    formChildren?: ReactNode | null;
}

function MediasBrowser({
    items: initialItems = null,
    extraItems = null,
    types = null,
    permissions = null,
    baseUrl = null,
    filters = defaultFilters,
    columns = defaultColumns,
    fields = defaultFields,
    query: initialQuery = null,
    layout: initialLayout = 'table',
    layouts = DEFAULT_LAYOUTS,
    theme = null,
    onMediaUploaded = null,
    onItemsChange = null,
    onLayoutChange = null,
    onMediaFormOpen = null,
    onMediaFormClose = null,
    selectable = false,
    selectedItems = null,
    onSelectionChange = null,
    multipleSelection = false,
    uppyConfig = DEFAULT_UPPY_CONFIG,
    withDelete = false,
    withTrash = false,
    withReplace = false,
    withStickySelection = false,
    withoutUpload = false,
    className = null,
    formChildren = null,
}: MediasBrowserProps) {
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

    const { trashed = null, ...queryWithoutTypes } = query || {};

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
        (newLayout: string) => {
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
        (media: Media) => {
            setCurrentMedia(media);
        },
        [setCurrentMedia],
    );

    const onCloseMedia = useCallback(() => {
        setCurrentMedia(null);
    }, [setCurrentMedia]);

    const onSaveMedia = useCallback(
        (item: Media) => {
            setCurrentMedia(null);
            updateItem(item);
        },
        [setCurrentMedia, updateItem],
    );

    const onReplaceMedia = useCallback(
        (item: Media) => {
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
        (id: string | number) =>
            !showTrashed && withTrash
                ? mediaTrash(id)
                      .then(() => {
                          if (!multipleSelection) {
                              const selectedId =
                                  selectedItems !== null && !Array.isArray(selectedItems)
                                      ? selectedItems.id || null
                                      : null;
                              if (
                                  selectedId !== null &&
                                  selectedId === id &&
                                  onSelectionChange !== null
                              ) {
                                  onSelectionChange(null);
                              }
                          }
                          // Todo remove from mult selection
                      })
                      .then(reload)
                : mediaDelete(id)
                      .then(() => {
                          if (!multipleSelection) {
                              const selectedId =
                                  selectedItems !== null && !Array.isArray(selectedItems)
                                      ? selectedItems.id || null
                                      : null;
                              if (
                                  selectedId !== null &&
                                  selectedId === id &&
                                  onSelectionChange !== null
                              ) {
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

    const [uploadedMedias, setUploadedMedias] = useState<Media[] | null>(null);
    const [uploadProcessing, setUploadProcessing] = useState(false);

    const onUploadedMediaChanged = useCallback(
        (newMedias: Media[] | Media | null) => {
            const uploadedNewMedias = (
                Array.isArray(newMedias)
                    ? [...newMedias, ...(uploadedMedias || [])]
                    : [newMedias, ...(uploadedMedias || [])]
            ).filter((it) => it !== null);
            setUploadedMedias(uploadedNewMedias);
            if (onSelectionChange !== null) {
                const firstMedia = Array.isArray(newMedias)
                    ? (newMedias[0] ?? null)
                    : (newMedias ?? null);
                onSelectionChange(
                    multipleSelection && Array.isArray(newMedias) ? newMedias : firstMedia,
                );
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
        (medias: Media[] | Media | null = null) => {
            if (showTrashed) {
                setShowTrashed(false);
            }

            if (medias === null) return;

            const rawMedias = (Array.isArray(medias) ? medias : [medias]).filter(
                (it) => it !== null,
            );
            if (onMediaUploaded !== null) {
                setUploadProcessing(true);
                Promise.resolve(onMediaUploaded(rawMedias as Media[]))
                    .then((newMedias) => {
                        onUploadedMediaChanged((newMedias as Media[] | Media | null) || null);
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
                  } as FilterItem,
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
                                getDeletePropsFromValue: () => ({
                                    href: null,
                                    withConfirmation: true,
                                    disabled: trashing || deleting,
                                    icon: showTrashed ? 'trash-fill' : 'trash',
                                    action: (ids) => onTrashMedia(ids[0]),
                                }),
                                getEditPropsFromValue: (it) => ({
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

export default MediasBrowser;
