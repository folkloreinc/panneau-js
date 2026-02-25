import isObject from 'lodash/isObject';
import omit from 'lodash/omit';
import queryString from 'query-string';
import type { MouseEvent, ReactNode } from 'react';
import { useCallback, useMemo } from 'react';

import type { Field } from '@panneau/core/types';
import Icon from '@panneau/element-icon';
import Link from '@panneau/element-link';

interface SortLinkProps {
    baseUrl?: string;
    query?: Record<string, any> | null;
    field?: string | Field | null;
    children?: ReactNode | null;
    parameterName?: string;
    directionParameterName?: string | null;
    directions?: (string | null)[];
    keepsPage?: boolean;
    onQueryChange?: ((query: Record<string, any> | null) => void) | null;
    onClick?: ((e: MouseEvent) => void) | null;
}

function SortLink({
    baseUrl = '',
    query = null,
    field = null,
    parameterName = 'order',
    directionParameterName = 'order_direction',
    directions = ['asc', 'desc', null],
    keepsPage = false,
    children = null,
    onQueryChange = null,
    onClick: customOnClick = null,
    ...props
}: SortLinkProps) {
    const { name: columnName } = isObject(field) ? (field as Field) : { name: field as string };
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
            ) as string[],
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
    }, [query, parameterName, columnName, directionParameterName, newSortDirection, keepsPage]);

    const onClick = useCallback(
        (e: MouseEvent) => {
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
}

export default SortLink;
