/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';
import { stringify as stringifyQuery } from 'query-string';
// import { defineMessages } from 'react-intl';

import { PropTypes as PanneauPropTypes } from '@panneau/core';

import Pagination from '@panneau/element-pagination';
import Card from '@panneau/element-card';
import Loading from '@panneau/element-loading';

// import Actions from './Actions';

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
    loading: PropTypes.bool,
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
    loading: false,
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
    loading,
    urlGenerator,
    // onQueryChange,
}) => {
    const { page: queryPage, ...queryWithoutPage } = query || {};
    const hasQuery = Object.keys(queryWithoutPage).length > 0;
    const { index_is_paginated: paginated = false, fields } = resource;

    const columns = fields.filter(({ hidden_in_index: hiddenInIndex = false }) => !hiddenInIndex);

    const currentUrl = `${baseUrl}${
        hasQuery
            ? `?${stringifyQuery(queryWithoutPage, {
                  arrayFormat: 'bracket',
              })}`
            : ''
    }`;

    return (
        <div className="">
            {items !== null ? (
                <div className="p-2">
                    {items.map((it) => {
                        const { id = null } = it || {};
                        return (
                            <div key={`card-${id}`}>
                                <Card title={id} />
                            </div>
                        );
                    })}
                </div>
            ) : null}
            {loading ? <Loading /> : null}
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
