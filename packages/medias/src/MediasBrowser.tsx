import classNames from 'classnames';
import uniqBy from 'lodash/uniqBy';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import type { Column, Field, Filter, Media, MediaType } from '@panneau/core';
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

interface LayoutItem {
    id: string;
    label: ReactNode;
    [key: string]: unknown;
}

export interface MediasBrowserProps {
    items?: Media[] | null;
    extraItems?: Media[] | null;
    types?: MediaType[] | null;
    permissions?: {
        create?: boolean;
        edit?: boolean;
        delete?: boolean;
    } | null;
    filters?: Filter[] | null;
    columns?: Column[] | null;
    query?: Record<string, unknown> | null;
    baseUrl?: string | null;
    fields?: Field[] | null;
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
    selectedItems?: Media[] | null;
    onSelectionChange?: ((items: Media[] | null) => void) | null;
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
    const baseQuery = { count: 12, ...initialQuery, ...(types !== null ? { types } : null) };
    const { query: fullQuery, onPageChange, onQueryChange, onQueryReset } = useQuery(baseQuery);
    const { page = null, count = null, ...query } = fullQuery || {};

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
        pagination: { lastPage = null, total = null } = {},
        pages = null,
        reload,
    } = useMedias(query, page, count, {
        items: baseItems,
        trashed: showTrashed,
        queryConfig: { staleTime: 0 },
    });

    const onClickTrash = () => {
        setShowTrashed(!showTrashed);
    };

    useEffect(() => {
        if (onItemsChange !== null) {
            onItemsChange(items);
        }
    }, [items, onItemsChange]);

    const [layout, setLayout] = useState(initialLayout || 'table');
    const hasLayouts = layouts !== null && layouts.length > 1;
    const onClickLayout = (newLayout: string) => {
        setLayout(newLayout);
        if (onLayoutChange !== null) {
            onLayoutChange(newLayout);
        }
    };

    const { currentMedia, setCurrentMedia } = useCurrentMedia();

    useEffect(() => {
        if (currentMedia !== null && onMediaFormOpen !== null) {
            onMediaFormOpen();
        }
        if (currentMedia === null && onMediaFormClose !== null) {
            onMediaFormClose();
        }
    }, [currentMedia, onMediaFormOpen, onMediaFormClose]);

    const onOpenMedia = (media: Media) => {
        setCurrentMedia(media);
    };

    const onCloseMedia = () => {
        setCurrentMedia(null);
    };

    const onSaveMedia = (item: Media) => {
        setCurrentMedia(null);
        updateItem(item);
    };

    const onReplaceMedia = (item: Media) => {
        setCurrentMedia(item);
        reload();
    };

    const onDeleteMedia = () => {
        if (reload !== null) {
            reload();
        }
    };

    const onTrashMedia = (id: string | number) =>
        (!showTrashed && withTrash ? mediaTrash(id) : mediaDelete(id))
            .then(() => {
                const newSelectedItems = (selectedItems || []).filter(
                    ({ id: itemId = null }) => itemId !== id,
                );
                if (onSelectionChange !== null) {
                    onSelectionChange(newSelectedItems.length > 0 ? newSelectedItems : null);
                }
            })
            .then(() => reload());

    const [uploadedMedias, setUploadedMedias] = useState<Media[] | null>(null);
    const [uploadProcessing, setUploadProcessing] = useState(false);

    const onUploadedMediaChanged = (newMedias: Media[] | Media | null) => {
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
                multipleSelection && Array.isArray(newMedias) ? newMedias : [firstMedia],
            );
            onQueryReset();
            reload();
            setUploadedMedias(null);
        }
    };

    const onUploadComplete = (medias: Media[] | Media | null = null) => {
        if (showTrashed) {
            setShowTrashed(false);
        }

        if (medias === null) return;

        const rawMedias = (Array.isArray(medias) ? medias : [medias]).filter((it) => it !== null);
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
    };

    const onClickPage = (e, pageNumber = null) => {
        e.preventDefault();
        e.stopPropagation();
        onPageChange(pageNumber);
    };

    const pagination = (
        <Pagination
            page={page}
            lastPage={lastPage}
            total={total}
            url={baseUrl}
            query={query}
            onClickPage={onClickPage}
            loading={loading && pages !== null}
            selectable={selectable}
            selectedItems={selectedItems}
            onSelectionChange={onSelectionChange}
            multipleSelection={multipleSelection}
            withPreviousNext
            alwaysShowButtons
        />
    );

    const hidePagination = loaded && !loading && total === 0;

    let finalFilters = withTrash
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
              } as Filter,
          ])
        : filters;
    if (types !== null && finalFilters !== null) {
        finalFilters = (finalFilters || []).map((filter) => {
            const { id = null } = filter || {};
            return id === 'types' ? { ...filter, disabled: true } : filter;
        });
    }

    const partialColumns =
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
            : columns;

    const finalColumns = (partialColumns || [])
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
        .filter((act) => act !== null);

    const showOnTopQuery = types === null ? query : queryWithoutTypes;
    const hasQueryItem =
        showOnTopQuery !== null && !trashed ? Object.keys(showOnTopQuery).length > 0 : false;

    const finalItems =
        withStickySelection &&
        (extraItems !== null || uploadedMedias !== null || uploadProcessing === true)
            ? uniqBy(
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
                                            ({ id: otherId = null }) => otherId === itemId,
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
              )
            : items;

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
                    <div className="border rounded p-2 bg-light mb-3">
                        <div className="d-flex flex-wrap gap-2 flex-row-reverse justify-content-end">
                            {canUpload ? (
                                <UploadField
                                    withButton
                                    withoutMedia
                                    className="w-auto ms-auto"
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
                            {filters !== null ? (
                                <Filters
                                    value={query}
                                    clearValue={types !== null ? queryWithoutTypes : null}
                                    filters={finalFilters}
                                    onChange={onQueryChange}
                                    onClear={onQueryReset}
                                    className="p-0"
                                />
                            ) : null}
                        </div>
                    </div>
                        {!hidePagination ? (
                            <div className="d-flex mb-3 justify-content-end">
                                {hasLayouts ? (
                                    <Buttons
                                        size="sm"
                                        theme="secondary"
                                        outline
                                        className="me-auto"
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
                        ) : null}
                    {layout === 'grid' ? (
                        <Grid
                            size="small"
                            component={MediaCard}
                            componentProps={{
                                className: 'd-flex w-100',
                                cardClassName: 'flex-grow-1',
                                vertical: true,
                                onClickDescription: (it) => onOpenMedia(it),
                            }}
                            selectable={selectable && !showTrashed}
                            selectedItems={selectedItems}
                            onSelectionChange={uploadProcessing ? null : onSelectionChange}
                            multipleSelection={multipleSelection}
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
