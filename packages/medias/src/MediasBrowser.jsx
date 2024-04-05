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
import Filters from '@panneau/filter-filters';

import { useMedias } from './hooks';

import MediaForm from './MediaForm';
import defaultColumns from './defaults/columns';
import defaultFields from './defaults/fields';
import defaultFilters from './defaults/filters';

import styles from './styles.module.scss';

const propTypes = {
    items: PanneauPropTypes.medias,
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
    onItemsChange: PropTypes.func,
    selectedCount: PropTypes.number,
    onClearSelected: PropTypes.func,
    className: PropTypes.string,
};

const defaultProps = {
    items: null,
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
    onItemsChange: null,
    selectedCount: null,
    onClearSelected: null,
    className: null,
};

function MediasBrowser({
    items: initialItems,
    baseUrl,
    buttons,
    filters,
    columns,
    // fields,
    query: initialQuery,
    layout: initialLayout,
    layouts,
    theme,
    tableProps,
    onSelectItem,
    onItemsChange,
    selectedCount,
    onClearSelected,
    className,
}) {
    const baseQuery = useMemo(() => initialQuery, [initialQuery]);
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
        medias: items,
        loading,
        lastPage,
        total,
    } = useMedias(query, page, count, { initialItems });

    useEffect(() => {
        if (onItemsChange !== null) {
            onItemsChange(items);
        }
    }, [items, onItemsChange]);

    const [layout, setLayout] = useState(initialLayout || 'grid');
    const hasLayouts = useMemo(() => layouts !== null && layouts.length > 1, [layouts]);
    const onClickLayout = useCallback(
        (lay) => {
            setLayout(lay);
        },
        [setLayout],
    );

    const [media, setMedia] = useState(null);

    const onOpenMedia = useCallback(
        (currentMedia) => {
            setMedia(currentMedia);
        },
        [setMedia],
    );

    const onCloseMedia = useCallback(() => {
        setMedia(null);
    }, [setMedia]);

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

    return (
        <div className={classNames([styles.container, className])}>
            {media !== null ? (
                <>
                    <div className="mt-2 mb-4">
                        <Button theme="primary" outline onClick={onCloseMedia} icon="arrow-left">
                            <FormattedMessage
                                defaultMessage="Back to files"
                                description="Button label"
                            />
                        </Button>
                    </div>
                    <MediaForm value={media} onClose={onCloseMedia} />
                </>
            ) : (
                <>
                    {buttons !== null ? <Buttons items={buttons} className="mb-2" /> : null}
                    {filters !== null ? (
                        <Filters
                            value={query}
                            filters={filters}
                            onChange={onQueryChange}
                            onReset={onQueryReset}
                            theme={theme}
                        />
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
                            size="xsmall"
                            theme={theme}
                            component={MediaCard}
                            componentProps={{
                                className: 'd-flex w-100',
                                cardClassName: 'flex-grow-1',
                                vertical: true,
                            }}
                            {...tableProps}
                            items={items || []}
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
                            onSelectItem={
                                onSelectItem !== null ? onSelectItem : (it) => onOpenMedia(it)
                            }
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
