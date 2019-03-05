/* eslint-disable react/button-has-type */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { pascal as pascalCase } from 'change-case';
import classNames from 'classnames';
import { ListEmpty } from '@panneau/list';
import get from 'lodash/get';
import { withComponentsCollection, PropTypes as PanneauPropTypes } from '@panneau/core';

import Column from './Column';
import * as TablePropTypes from './PropTypes';

import styles from './styles.scss';

const propTypes = {
    items: PropTypes.arrayOf(PropTypes.object),
    striped: PropTypes.bool,
    hoverable: PropTypes.bool,
    responsive: PropTypes.bool,
    tableClassName: PropTypes.string,
    cols: TablePropTypes.columns,
    columnsCollection: PanneauPropTypes.componentsCollection,
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
    cols: [
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
    columnsCollection: null,
    emptyListText: undefined,
    onClickAction: null,
    onClickButton: null,
};

class TableList extends Component {
    constructor(props) {
        super(props);

        this.onClickAction = this.onClickAction.bind(this);
        this.onClickButton = this.onClickButton.bind(this);
        this.renderTableHeader = this.renderTableHeader.bind(this);
        this.renderTableHeaderColumn = this.renderTableHeaderColumn.bind(this);
        this.renderTableBody = this.renderTableBody.bind(this);
        this.renderTableBodyRow = this.renderTableBodyRow.bind(this);
        this.renderTableBodyColumn = this.renderTableBodyColumn.bind(this);
    }

    onClickAction(...args) {
        const { onClickAction } = this.props;
        if (onClickAction !== null) {
            onClickAction(...args);
        }
    }

    onClickButton(...args) {
        const { onClickButton } = this.props;
        if (onClickButton !== null) {
            onClickButton(...args);
        }
    }

    getColumnComponent(type = 'value') {
        const { columnsCollection } = this.props;
        return columnsCollection !== null ? columnsCollection.getComponent(type) : null;
    }

    renderTableHeader(columns) {
        const headerColumns = columns.map(this.renderTableHeaderColumn);

        return (
            <thead>
                <tr>{headerColumns}</tr>
            </thead>
        );
    }

    renderTableHeaderColumn(column, index) {
        const columnMethodName = `getTableHeader${pascalCase(column.id)}Column`;
        if (typeof this[columnMethodName] === 'function') {
            return this[columnMethodName](column, index);
        }
        if (typeof this.getTableHeaderColumn === 'function') {
            return this.getTableHeaderColumn(column, index);
        }

        const key = `header_${column.name}_${index}`;

        return (
            <Column key={key} head {...column}>
                {column.label}
            </Column>
        );
    }

    renderTableBody(columns, items) {
        if (!items || !items.length) {
            return <tbody>{this.renderTableBodyNoItemsRow(columns)}</tbody>;
        }

        const bodyRows = [];
        items.forEach((it, index) => {
            bodyRows.push(this.renderTableBodyRow(columns, it, index));
        });

        return <tbody>{bodyRows}</tbody>;
    }

    renderTableBodyNoItemsRow(columns) {
        const { emptyListText } = this.props;
        const colspan = columns.length;
        return (
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
        );
    }

    renderTableBodyRow(columns, it, rowIndex) {
        if (this.getTableBodyRow) {
            const row = this.getTableBodyRow(columns, it, rowIndex);
            if (row) {
                return row;
            }
        }

        const columnsRows = [];
        columns.forEach((column, colIndex) => {
            columnsRows.push(this.renderTableBodyColumn(it, column, rowIndex, colIndex));
        });

        const id = get(it, 'id', rowIndex);
        const key = `row_${id}_${rowIndex}`;

        return <tr key={key}>{columnsRows}</tr>;
    }

    renderTableBodyColumn(it, column, rowIndex, colIndex) {
        const id = get(it, 'id', rowIndex);
        const key = `row_${id}_${column.id}`;

        const ColumnComponent = this.getColumnComponent(column.type);
        if (ColumnComponent !== null) {
            // prettier-ignore
            return (
                <ColumnComponent
                    key={key}
                    column={column}
                    item={it}
                    itemIndex={rowIndex}
                    columnIndex={colIndex}
                    onClickAction={(e, action) => (
                        this.onClickAction(e, action, it, rowIndex, column, colIndex)
                    )}
                    onClickButton={(e, button) => (
                        this.onClickButton(e, button, it, rowIndex, column, colIndex)
                    )}
                />
            );
        }

        return (
            <Column key={key} {...column} />
        );
    }

    render() {
        const {
            items, cols, striped, hoverable, responsive, tableClassName,
        } = this.props;

        const containerClassNames = classNames({
            [styles.container]: true,
        });

        const itemsClassNames = classNames({
            [styles.items]: true,
        });

        const header = this.renderTableHeader(cols);
        const body = this.renderTableBody(cols, items);
        const tableClassNames = classNames({
            table: true,
            'table-sm': true,
            'table-striped': striped,
            'table-hover': hoverable,
            'table-responsive': responsive,
            [tableClassName]: tableClassName !== null,
        });

        return (
            <div className={containerClassNames}>
                <div className={itemsClassNames}>
                    <table className={tableClassNames}>
                        {header}
                        {body}
                    </table>
                </div>
            </div>
        );
    }
}

TableList.propTypes = propTypes;
TableList.defaultProps = defaultProps;

const mapCollectionToProps = (
    { componentsCollection: propsCollection, columnsCollection = null },
    { componentsCollection: contextCollection },
) => {
    if (columnsCollection !== null) {
        return columnsCollection;
    }
    const collection = propsCollection || contextCollection || null;
    return {
        columnsCollection: collection !== null ? collection.getCollection('tableColumns') : null,
    };
};
export default withComponentsCollection(mapCollectionToProps)(TableList);
