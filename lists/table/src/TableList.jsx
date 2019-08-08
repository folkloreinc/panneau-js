/* eslint-disable react/button-has-type */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { ListEmpty } from '@panneau/list';
import get from 'lodash/get';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useComponents } from '@panneau/core/contexts';

import Column from './Column';
import * as TablePropTypes from './PropTypes';

import styles from './styles.scss';

const propTypes = {
    items: PropTypes.arrayOf(PropTypes.object),
    striped: PropTypes.bool,
    hoverable: PropTypes.bool,
    responsive: PropTypes.bool,
    tableClassName: PropTypes.string,
    columns: TablePropTypes.columns,
    columnsComponents: PanneauPropTypes.components,
    emptyListText: PanneauPropTypes.message,
    onClickAction: PropTypes.func,
    onClickButton: PropTypes.func,
};

const defaultProps = {
    items: [],
    striped: false,
    hoverable: true,
    responsive: false,
    tableClassName: null,
    columns: [
        {
            id: 'id',
            path: 'id',
            label: 'ID',
            width: 50,
        },
        {
            id: 'actions',
            label: 'Actions',
            type: 'actions',
            align: 'right',
        },
    ],
    columnsComponents: null,
    emptyListText: undefined,
    onClickAction: null,
    onClickButton: null,
};

const TableList = ({
    items,
    columns,
    striped,
    hoverable,
    responsive,
    tableClassName,
    columnsComponents,
    emptyListText,
    onClickAction,
    onClickButton,
}) => {
    const columnsCollection = useComponents('tableColumns', columnsComponents);
    const colspan = columns.length;

    const header = (
        <thead>
            <tr>
                {columns.map((column, index) => {
                    const key = `header_${column.name}_${index}`;

                    return (
                        <Column key={key} head {...column}>
                            {column.label}
                        </Column>
                    );
                })}
            </tr>
        </thead>
    );

    const body =
        !items || !items.length ? (
            <tbody>
                <tr>
                    <td
                        className={classNames({
                            [styles.emptyRow]: true,
                        })}
                        colSpan={colspan}
                    >
                        <ListEmpty label={emptyListText} />
                    </td>
                </tr>
            </tbody>
        ) : (
            <tbody>
                {items.map((it, rowIndex) => {
                    const id = get(it, 'id', rowIndex);
                    const key = `row_${id}_${rowIndex}`;

                    return (
                        <tr key={key}>
                            {columns.map((column, colIndex) => {
                                const columnKey = `row_${id}_${column.id}`;
                                const { type = null, path = null } = column;
                                const ColumnComponent = columnsCollection.getComponent(
                                    type === null && path !== null ? 'value' : type,
                                );
                                if (ColumnComponent !== null) {
                                    return (
                                        <ColumnComponent
                                            key={columnKey}
                                            column={column}
                                            item={it}
                                            itemIndex={rowIndex}
                                            columnIndex={colIndex}
                                            onClickAction={(e, action) =>
                                                onClickAction !== null
                                                    ? onClickAction(
                                                          e,
                                                          action,
                                                          it,
                                                          rowIndex,
                                                          column,
                                                          colIndex,
                                                      )
                                                    : null
                                            }
                                            onClickButton={(e, button) =>
                                                onClickButton !== null
                                                    ? onClickButton(
                                                          e,
                                                          button,
                                                          it,
                                                          rowIndex,
                                                          column,
                                                          colIndex,
                                                      )
                                                    : null
                                            }
                                        />
                                    );
                                }

                                return <Column key={columnKey} {...column} />;
                            })}
                        </tr>
                    );
                })}
            </tbody>
        );

    return (
        <div className={classNames([styles.container])}>
            <div className={classNames([styles.items])}>
                <table
                    className={classNames([
                        'table',
                        'table-sm',
                        styles.table,
                        {
                            'table-striped': striped,
                            'table-hover': hoverable,
                            'table-responsive': responsive,
                            [tableClassName]: tableClassName !== null,
                        },
                    ])}
                >
                    {header}
                    {body}
                </table>
            </div>
        </div>
    );
};

TableList.propTypes = propTypes;
TableList.defaultProps = defaultProps;

export default TableList;
