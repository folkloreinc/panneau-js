/* eslint-disable react/jsx-props-no-spreading, react/no-array-index-key */
import classNames from 'classnames';
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
// import UploadField from '@panneau/field-upload';
import Filters from '@panneau/filter-filters';

import { useMedias } from './hooks';

import MediaForm from './MediaForm';
import { useMediasForm } from './MediasFormContext';
import defaultColumns from './defaults/columns';
import defaultFields from './defaults/fields';
import defaultFilters from './defaults/filters';

import styles from './styles.module.scss';

const propTypes = {
    items: PanneauPropTypes.medias,
    types: PropTypes.arrayOf(PropTypes.string),
    // uploadButton: PropTypes.shape({
    //     value: PropTypes.oneOfType([PanneauPropTypes.medias, PanneauPropTypes.media]),
    // }),
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
    onSelectItem: PropTypes.func,
    onSelectItems: PropTypes.func,
    onItemsChange: PropTypes.func,
    onLayoutChange: PropTypes.func,
    selectedCount: PropTypes.number,
    onClearSelected: PropTypes.func,
    className: PropTypes.string,
};

const defaultProps = {
    items: null,
    types: null,
    // uploadButton: null,
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
    onSelectItem: null,
    onSelectItems: null,
    onItemsChange: null,
    onLayoutChange: null,
    selectedCount: null,
    onClearSelected: null,
    className: null,
};

function MediasBrowser({
    items: initialItems,
    types,
    baseUrl,
    // uploadButton,
    buttons,
    filters,
    columns,
    fields,
    query: initialQuery,
    layout: initialLayout,
    layouts,
    theme,
    tableProps,
    onSelectItem,
    onSelectItems,
    onItemsChange,
    onLayoutChange,
    selectedCount,
    onClearSelected,
    className,
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
    const { types: queryTypes = null, ...queryWithoutTypes } = query || {};

    const {
        medias: items,
        loading,
        lastPage,
        total,
    } = useMedias(query, page, count, { items: baseItems });

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

    // TODO: context for this?
    const onChangeMedia = useCallback(
        (media = null) => {
            onSelectItems(media);
            onQueryReset();
        },
        [setCurrentMedia, onQueryReset, onSelectItems],
    );

    const onSaveMedia = useCallback(() => {
        setCurrentMedia(null);
        onQueryReset();
    }, [setCurrentMedia, onQueryReset]);

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
        if (types !== null && filters !== null) {
            return (filters || []).map((filter) => {
                const { id = null } = filter || {};
                return id === 'types' ? { ...filter, disabled: true } : filter;
            });
        }
        return filters;
    }, [filters, types]);

    return (
        <div className={classNames([styles.container, className])}>
            {currentMedia !== null ? (
                <>
                    <div className="mt-2 mb-4">
                        <Button theme="primary" outline onClick={onCloseMedia} icon="arrow-left">
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
                    />
                </>
            ) : (
                <>
                    {filters !== null ? (
                        <Filters
                            className="mt-0 pt-0"
                            value={query}
                            clearValue={types !== null ? queryWithoutTypes : null}
                            filters={finalFilters}
                            onChange={onQueryChange}
                            onReset={onQueryReset}
                            theme={theme}
                        >
                            {buttons !== null ? (
                                <Buttons items={buttons} className="ms-xl-auto" />
                            ) : null}
                        </Filters>
                    ) : null}
                    {filters === null && buttons !== null ? (
                        <div className="mt-2 mb-2">
                            {buttons !== null ? (
                                <Buttons items={buttons} className="ms-xl-auto" />
                            ) : null}
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
                                selectable: onSelectItem !== null,
                                onClickDescription: (it) => {
                                    onOpenMedia(it);
                                },
                            }}
                            {...tableProps}
                            items={items || []}
                            loading={loading}
                            onSelectItem={
                                onSelectItem !== null ? onSelectItem : (it) => onOpenMedia(it)
                            }
                        />
                    ) : null}
                    {layout === 'table' ? (
                        <Table
                            theme={theme}
                            columns={columns}
                            displayPlaceholder={
                                <span className="text-secondary text-opacity-75">—</span>
                            }
                            {...tableProps}
                            items={items}
                            loading={loading}
                            onSelectItem={
                                onSelectItem !== null ? onSelectItem : (it) => onOpenMedia(it)
                            }
                            actionsProps={{
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
