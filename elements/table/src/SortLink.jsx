/* eslint-disable react/jsx-props-no-spreading */
import isObject from 'lodash-es/isObject';
import omit from 'lodash-es/omit';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import React, { useCallback, useMemo } from 'react';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import Icon from '@panneau/element-icon';
import Link from '@panneau/element-link';

const propTypes = {
    baseUrl: PropTypes.string,
    query: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    field: PropTypes.oneOfType([PropTypes.string, PanneauPropTypes.field]),
    children: PropTypes.node,
    parameterName: PropTypes.string,
    directionParameterName: PropTypes.string,
    directions: PropTypes.arrayOf(PropTypes.string),
    keepsPage: PropTypes.bool,
    onQueryChange: PropTypes.func,
    onClick: PropTypes.func,
};

const defaultProps = {
    baseUrl: '',
    query: null,
    field: null,
    children: null,
    parameterName: 'order',
    directionParameterName: 'order_direction',
    directions: ['asc', 'desc', null],
    keepsPage: false,
    onQueryChange: null,
    onClick: null,
};

const SortLink = ({
    baseUrl,
    query,
    field,
    parameterName,
    directionParameterName,
    directions,
    keepsPage,
    children,
    onQueryChange,
    onClick: customOnClick,
    ...props
}) => {
    const { name: columnName } = isObject(field) ? field : { name: field };
    const { [parameterName]: currentSortValue = null } = query || {};
    const [currentSort, fallbackCurrentDirection = null] = (currentSortValue || '').split(',');
    const currentSortDirection =
        directionParameterName !== null
            ? (query || {})[directionParameterName] || null
            : fallbackCurrentDirection;
    const sortDirectionIndex = directions.indexOf(currentSortDirection);
    const newSortDirection =
        directions[sortDirectionIndex === directions.length - 1 ? 0 : sortDirectionIndex + 1];

    const newQuery = useMemo(() => {
        const queryWithoutSort = omit(
            query || {},
            [parameterName, directionParameterName, !keepsPage ? 'page' : null].filter(
                (it) => it !== null,
            ),
        );
        if (newSortDirection === null && Object.keys(queryWithoutSort).length === 0) {
            return null;
        }
        const sortQuery =
            directionParameterName !== null
                ? {
                      [parameterName]: columnName,
                      [directionParameterName]: newSortDirection,
                  }
                : {
                      [parameterName]: [columnName, newSortDirection]
                          .filter((it) => it !== null)
                          .join(','),
                  };
        return newSortDirection !== null
            ? {
                  ...queryWithoutSort,
                  ...sortQuery,
              }
            : queryWithoutSort;
    }, [query, parameterName, columnName, directionParameterName, newSortDirection]);

    const onClick = useCallback(
        (e) => {
            if (onQueryChange !== null) {
                e.preventDefault();
                onQueryChange(newQuery);
            }
            if (customOnClick !== null) {
                customOnClick(e);
            }
        },
        [newQuery, onQueryChange, customOnClick],
    );

    return (
        <Link
            href={`${baseUrl || ''}${
                newQuery !== null ? `?${queryString.stringify(newQuery)}` : ''
            }`}
            onClick={onClick}
            {...props}
        >
            {children}
            {currentSort === columnName && currentSortDirection !== null ? (
                <Icon
                    name={currentSortDirection === 'desc' ? 'caret-down-fill' : 'caret-up-fill'}
                    className="ms-1"
                />
            ) : null}
        </Link>
    );
};

SortLink.propTypes = propTypes;
SortLink.defaultProps = defaultProps;

export default SortLink;
