import classNames from 'classnames';
import type { ReactNode } from 'react';

import type { Column } from '@panneau/core';

import SortLink from './SortLink';

export interface TableColumn extends Column {
    sortable?: boolean;
    sortColumnName?: string | null;
    sortColumnParameter?: string;
    sortDirectionParameter?: string;
    sortDirections?: (string | null)[];
    columnClassName?: string | null;
    headClassName?: string | null;
}

interface TableProps {
    columns?: TableColumn[];
    children?: ReactNode;
    theme?: string | null;
    baseUrl?: string | null;
    query?: Record<string, unknown> | null;
    sortColumnParameter?: string;
    sortDirectionParameter?: string;
    onQueryChange?: ((query: Record<string, unknown>) => void) | null;
    striped?: boolean;
    stripedColumns?: boolean;
    className?: string | null;
}

const DEFAULT_COLUMNS: TableColumn[] = [];

function Table({
    columns = DEFAULT_COLUMNS,
    children = null,
    theme = null,
    baseUrl = null,
    query = null,
    sortColumnParameter = 'order',
    sortDirectionParameter = 'order_direction',
    onQueryChange = null,
    striped = false,
    stripedColumns = false,
    className = null,
}: TableProps) {
    return (
        <table
            className={classNames([
                'table',
                'table-sm',
                'table-hover',
                'align-middle',
                'mb-0',
                theme !== null ? `table-${theme}` : null,
                {
                    'table-striped': striped,
                    'table-striped-columns': stripedColumns,
                },
                className,
            ])}
        >
            <thead>
                <tr>
                    {columns.map((column, idx: number) => {
                        const {
                            id,
                            field = null,
                            label = null,
                            path = null,
                            headClassName = null,
                            sortable: columnSortable = false,
                            sortColumnName = null,
                            sortColumnParameter: columnSortColumnParameter,
                            sortDirectionParameter: columnSortDirectionParameter,
                            sortDirections,
                        } = column;
                        return (
                            <th
                                scope="col"
                                className={headClassName || undefined}
                                key={`col-${id ?? ''}-${idx + 1}`}
                            >
                                {columnSortable ? (
                                    <SortLink
                                        className="text-nowrap"
                                        baseUrl={baseUrl || undefined}
                                        query={query}
                                        field={sortColumnName || field || path}
                                        parameterName={
                                            columnSortColumnParameter || sortColumnParameter
                                        }
                                        directionParameterName={
                                            columnSortDirectionParameter || sortDirectionParameter
                                        }
                                        directions={sortDirections}
                                        onQueryChange={onQueryChange}
                                    >
                                        {label as ReactNode}
                                    </SortLink>
                                ) : (
                                    <span className="text-nowrap">{label as ReactNode}</span>
                                )}
                            </th>
                        );
                    })}
                </tr>
            </thead>
            <tbody>{children}</tbody>
        </table>
    );
}

export default Table;
