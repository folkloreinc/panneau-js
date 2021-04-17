/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';
import { stringify as stringifyQuery } from 'query-string';
// import { defineMessages } from 'react-intl';

import { PropTypes as PanneauPropTypes } from '@panneau/core';

import Pagination from '@panneau/element-pagination';
import Loading from '@panneau/element-loading';

import Actions from './Actions';

// import ResourceItemActions from '../buttons/ResourceItemActions';
// import * as FieldIndexComponents from '../index/index';

// const resourcesMessages = defineMessages({
//     create: {
//         id: 'resources.create',
//         defaultMessage: 'Create {a_singular}',
//     },
//     edit: {
//         id: 'resources.edit',
//         defaultMessage: 'Edit {a_singular}',
//     },
//     delete: {
//         id: 'resources.delete',
//         defaultMessage: 'Delete {a_singular}',
//     },
//     created: {
//         id: 'resources.created',
//         defaultMessage: '{The_singular} has been created.',
//     },
//     deleted: {
//         id: 'resources.deleted',
//         defaultMessage: '{The_singular} has been deleted.',
//     },
//     loading: {
//         id: 'resources.loading',
//         defaultMessage: 'Loading {plural}...',
//     },
// });

const propTypes = {
    resource: PanneauPropTypes.resource.isRequired,
    items: PanneauPropTypes.items,
    query: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    page: PropTypes.number,
    lastPage: PropTypes.number,
    total: PropTypes.number,
    baseUrl: PropTypes.string,
    urlGenerator: PropTypes.func,
    // onQueryChange: PropTypes.func,
};

const defaultProps = {
    items: [],
    query: null,
    page: null,
    lastPage: null,
    total: null,
    baseUrl: null,
    urlGenerator: null,
    // onQueryChange: null,
};

const TableList = ({
    query,
    resource,
    items,
    page,
    lastPage,
    total,
    baseUrl,
    urlGenerator,
    // onQueryChange,
}) => {
    const { page: queryPage, ...queryWithoutPage } = query || {};
    const hasQuery = Object.keys(queryWithoutPage).length > 0;
    const { index_is_paginated: paginated = false, fields } = resource;

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

    console.log(fields);

    return (
        <div>
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
                        {items.map((it) => {
                            const { id = null } = it || {};
                            return (
                                <tr key={`row-${id}`}>
                                    <td className="col-auto">{id}</td>
                                    {columns.map((field) => {
                                        const { name } = field || {};
                                        const value = it[name] ? it[name] : null;
                                        console.log(it, field);
                                        // console.log('it', it);
                                        // const {
                                        //     index: indexComponent = 'text',
                                        //     index_column: indexColumnComponent = null,
                                        // } = components || {};
                                        // const FieldIndexComponent = getComponentFromName(
                                        //     {}, // FieldIndexComponents,
                                        //     indexColumnComponent || indexComponent,
                                        //     'text',
                                        // );

                                        return (
                                            <td className="col-auto" key={`row-${id}-${name}`}>
                                                {/* <FieldIndexComponent
                                                field={field}
                                                value={it[name] || null}
                                            /> */}
                                                {value || 'No value'}
                                            </td>
                                        );
                                    })}
                                    <td className="text-end col-auto">
                                        <Actions
                                            resource={resource}
                                            item={it}
                                            urlGenerator={urlGenerator}
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            ) : (
                <Loading>Loading</Loading>
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

TableList.propTypes = propTypes;
TableList.defaultProps = defaultProps;

export default TableList;
