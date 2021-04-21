/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';
import { stringify as stringifyQuery } from 'query-string';
// import { defineMessages } from 'react-intl';

import { PropTypes as PanneauPropTypes } from '@panneau/core';

import Pagination from '@panneau/element-pagination';
import Card from '@panneau/element-card';
import Loading from '@panneau/element-loading';
import FormActions from '@panneau/element-form-actions';

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
    const { index_is_paginated: paginated = false } = resource;

    // const columns = fields.filter(({ hidden_in_index: hiddenInIndex = false }) => !hiddenInIndex);

    const currentUrl = `${baseUrl}${
        hasQuery
            ? `?${stringifyQuery(queryWithoutPage, {
                  arrayFormat: 'bracket',
              })}`
            : ''
    }`;

    return (
        <div className="d-flex flex-wrap">
            {items !== null
                ? items.map((it) => {
                      const { id = null } = it || {};
                      return (
                          <div className="w-50 p-2" key={`card-${id}`}>
                              <Card header={id}>
                                  <FormActions
                                      resource={resource}
                                      item={it}
                                      urlGenerator={urlGenerator}
                                  />
                              </Card>
                          </div>
                      );
                  })
                : null}
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
