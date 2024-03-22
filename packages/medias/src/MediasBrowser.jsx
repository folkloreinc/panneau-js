/* eslint-disable react/jsx-props-no-spreading, react/no-array-index-key */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useState } from 'react';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useQuery } from '@panneau/core/hooks';
import Buttons from '@panneau/element-buttons';
import Grid from '@panneau/element-grid';
import Icon from '@panneau/element-icon';
import MediaCard from '@panneau/element-media-card';
import Pagination from '@panneau/element-pagination';
import Table from '@panneau/element-table';
import Filters from '@panneau/filter-filters';

import { useMedias } from './hooks';

import defaultColumns from './columns';
import defaultFilters from './filters';

import styles from './styles.module.scss';

const propTypes = {
    items: PanneauPropTypes.medias,
    filters: PanneauPropTypes.filters,
    columns: PanneauPropTypes.tableColumns,
    query: PropTypes.shape({}),
    baseUrl: PropTypes.string,
    // fields: PanneauPropTypes.fields,
    layout: PropTypes.string,
    layouts: PropTypes.arrayOf(PropTypes.shape({})),
    theme: PropTypes.string,
    tableProps: PropTypes.bool,
    className: PropTypes.string,
};

const defaultProps = {
    items: null,
    filters: defaultFilters,
    columns: defaultColumns,
    // fields: null,
    query: null,
    baseUrl: null,
    layout: null,
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
    className: null,
};

function MediasBrowser({
    items: initialItems,
    baseUrl,
    filters,
    columns,
    // fields,
    query: initialQuery,
    layout: initialLayout,
    layouts,
    theme,
    tableProps,
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

    const [layout, setLayout] = useState(initialLayout || 'grid');
    const hasLayouts = useMemo(() => layouts !== null && layouts.length > 1, [layouts]);
    const onClickLayout = useCallback(
        (lay) => {
            setLayout(lay);
        },
        [setLayout],
    );

    return (
        <div className={classNames([styles.container, className])}>
            <Filters
                value={query}
                filters={filters}
                onChange={onQueryChange}
                onReset={onQueryReset}
                theme={theme}
            />
            <div
                className={classNames([
                    'd-flex',
                    'mt-1',
                    'mb-3',
                    { 'justify-content-between': hasLayouts, 'justify-content-end': !hasLayouts },
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
                        }))}
                    />
                ) : null}
                <Pagination
                    page={page}
                    lastPage={lastPage}
                    total={total}
                    url={baseUrl}
                    query={query}
                    onClickPage={onPageChange}
                    theme={theme}
                    loading={loading}
                    withPreviousNext
                    alwaysShowButtons
                />
            </div>
            {layout === 'grid' ? (
                <Grid
                    {...tableProps}
                    items={items || []}
                    component={MediaCard}
                    componentProps={{ className: 'd-flex w-100', cardClassName: 'flex-grow-1' }}
                />
            ) : (
                <Table {...tableProps} columns={columns} items={items} />
            )}
            <div className={classNames(['d-flex', 'mt-3', 'mb-1', 'justify-content-end'])}>
                <Pagination
                    page={page}
                    lastPage={lastPage}
                    total={total}
                    url={baseUrl}
                    query={query}
                    onClickPage={onPageChange}
                    theme={theme}
                    loading={loading}
                    withPreviousNext
                    alwaysShowButtons
                />
            </div>
        </div>
    );
}

MediasBrowser.propTypes = propTypes;
MediasBrowser.defaultProps = defaultProps;

export default MediasBrowser;
