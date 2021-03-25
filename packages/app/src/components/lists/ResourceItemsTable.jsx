/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';
import { stringify as stringifyQuery } from 'query-string';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { getComponentFromName } from '@panneau/core/utils';

import Pagination from '@panneau/element-pagination';
import Loading from '@panneau/element-loading';

import ResourceItemActions from '../buttons/ResourceItemActions';
import ResourceListFilters from '../partials/ResourceListFilters';
import ResourceLabel from '../partials/ResourceLabel';
import resourcesMessages from '../resourcesMessages';
// import * as FieldIndexComponents from '../index/index';

const propTypes = {
    resource: PanneauPropTypes.resource.isRequired,
    items: PanneauPropTypes.items,
    query: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    page: PropTypes.number,
    lastPage: PropTypes.number,
    total: PropTypes.number,
    baseUrl: PropTypes.string,
    onQueryChange: PropTypes.func,
};

const defaultProps = {
    items: [],
    query: null,
    page: null,
    lastPage: null,
    total: null,
    baseUrl: null,
    onQueryChange: null,
};

const ResourceItemsTableList = ({
    query,
    resource,
    items,
    page,
    lastPage,
    total,
    baseUrl,
    onQueryChange,
}) => {
    const { page: queryPage, ...queryWithoutPage } = query || {};
    const hasQuery = Object.keys(queryWithoutPage).length > 0;
    const { id, index_is_paginated: paginated = false, fields } = resource;
    const columns = fields
        .filter(({ hidden_in_index: hiddenInIndex = false }) => !hiddenInIndex)
        .sort(({ order_in_index: aOrder = null }, { order_in_index: bOrder = null }) => {
            if (aOrder === bOrder) {
                return 0;
            }
            if (aOrder === null) {
                return 1;
            }
            if (bOrder === null) {
                return -1;
            }
            return aOrder > bOrder ? 1 : -1;
        });
    const currentUrl = `${baseUrl}${
        hasQuery
            ? `?${stringifyQuery(queryWithoutPage, {
                  arrayFormat: 'bracket',
              })}`
            : ''
    }`;
    let filters;
    if (id === 'performances') {
        filters = ['edition', 'room_performances'];
    } else if (id === 'rooms') {
        filters = ['edition'];
    }
    return (
        <div>
            <ResourceListFilters
                filters={filters}
                value={hasQuery ? queryWithoutPage : null}
                onSubmit={onQueryChange}
                className="mb-4"
            />
            {items !== null ? (
                <table className="table table-sm table-hover mb-0">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            {columns.map(({ name, label }) => (
                                <th scope="col" key={`col-${name}`}>
                                    {label}
                                </th>
                            ))}
                            <th scope="col">&nbsp;</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((it) => (
                            <tr key={`row-${it.id}`}>
                                <td>{it.id}</td>
                                {columns.map((field) => {
                                    const { name, components } = field;
                                    const {
                                        index: indexComponent = 'text',
                                        index_column: indexColumnComponent = null,
                                    } = components || {};
                                    const FieldIndexComponent = getComponentFromName(
                                        {}, // FieldIndexComponents,
                                        indexColumnComponent || indexComponent,
                                        'text',
                                    );
                                    return (
                                        <td key={`row-${it.id}-${name}`}>
                                            <FieldIndexComponent
                                                field={field}
                                                value={it[name] || null}
                                            />
                                        </td>
                                    );
                                })}
                                <td className="text-right">
                                    <ResourceItemActions item={it} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <Loading>
                    <ResourceLabel resource={resource}>{resourcesMessages.loading}</ResourceLabel>
                </Loading>
            )}
            {paginated && lastPage > 1 ? (
                <Pagination
                    page={page}
                    lastPage={lastPage}
                    total={total}
                    url={currentUrl}
                    className="mt-4"
                />
            ) : null}
        </div>
    );
};

ResourceItemsTableList.propTypes = propTypes;
ResourceItemsTableList.defaultProps = defaultProps;

export default ResourceItemsTableList;
