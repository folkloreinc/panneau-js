import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { pascal as pascalCase } from 'change-case';
import classNames from 'classnames';
import { ListActions } from '@panneau/list';
import omit from 'lodash/omit';
import get from 'lodash/get';

import styles from './styles.scss';

const propTypes = {
    items: PropTypes.arrayOf(PropTypes.object),
    pagination: PropTypes.bool,
    cols: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.required,
        label: PropTypes.string.required,
        path: PropTypes.string,
        type: PropTypes.string,
        width: PropTypes.number,
    })),
    onClickActions: PropTypes.func,
};

const defaultProps = {
    items: [],
    pagination: true,
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
        },
    ],
    onClickActions: null,
};

class TableList extends Component {
    constructor(props) {
        super(props);

        this.onClickActions = this.onClickActions.bind(this);
        this.renderTable = this.renderTable.bind(this);
        this.renderTableHeader = this.renderTableHeader.bind(this);
        this.renderTableHeaderColumn = this.renderTableHeaderColumn.bind(this);
        this.renderTableBody = this.renderTableBody.bind(this);
        this.renderTableBodyRow = this.renderTableBodyRow.bind(this);
        this.renderTableBodyColumn = this.renderTableBodyColumn.bind(this);
        this.getTableBodyButtonsColumn = this.getTableBodyButtonsColumn.bind(this);
        this.renderTableButton = this.renderTableButton.bind(this);
        this.renderTableButtonIcon = this.renderTableButtonIcon.bind(this);
    }

    onClickActions(e, action, it, rowIndex) {
        if (this.props.onClickActions) {
            this.props.onClickActions(e, action, it, rowIndex);
        }
    }

    // eslint-disable-next-line react/sort-comp
    renderTable(columns, items) {
        const header = this.renderTableHeader(columns);
        const body = this.renderTableBody(columns, items);
        const tableClassNames = classNames({
            table: true,
        });

        return (
            <table
                className={tableClassNames}
            >
                { header }
                { body }
            </table>
        );
    }

    renderTableHeader(columns) {
        const headerColumns = columns.map(this.renderTableHeaderColumn);

        return (
            <thead>
                <tr>
                    { headerColumns }
                </tr>
            </thead>
        );
    }

    renderTableHeaderColumn(column, index) {
        const columnMethodName = `getTableHeader${pascalCase(column.id)}Column`;
        if (typeof this[columnMethodName] === 'function') {
            return this[columnMethodName](column, index);
        } else if (typeof this.getTableHeaderColumn === 'function') {
            return this.getTableHeaderColumn(column, index);
        }

        const key = `header_${column.name}_${index}`;
        const props = omit(column, ['key', 'label', 'path']);

        return (
            <th
                key={key}
                {...props}
            >
                {column.label}
            </th>
        );
    }

    renderTableBody(columns, items) {
        const bodyRows = [];
        items.forEach((it, index) => {
            bodyRows.push(this.renderTableBodyRow(columns, it, index));
        });

        return (
            <tbody>
                { bodyRows }
            </tbody>
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

        return (
            <tr
                key={key}
            >
                { columnsRows }
            </tr>
        );
    }

    renderTableBodyColumn(it, column, rowIndex, colIndex) {
        const columnMethodName = `renderTableBody${pascalCase(column.type)}Column`;
        if (typeof column.type !== 'undefined' && typeof this[columnMethodName] === 'function') {
            return this[columnMethodName](it, column, rowIndex, colIndex);
        }

        const id = get(it, 'id', rowIndex);
        const key = `row_${id}_${column.id}`;
        const data = get(it, column.path, null);

        const props = omit(column, ['value', 'label', 'name', 'path']);

        return (
            <td
                key={key}
                {...props}
            >
                { data }
            </td>
        );
    }

    renderTableBodyActionsColumn(it, column, rowIndex, colIndex) {
        const key = `row_${rowIndex}_actions`;
        return (
            <td
                key={key}
            >
                <ListActions
                    item={it}
                    onClick={(e, action) => this.onClickActions(e, action, it, rowIndex)}
                    {...column}
                />
            </td>
        );
    }

    getTableBodyButtonsColumn(it, column, rowIndex, colIndex) {
        const id = get(it, 'id', rowIndex);
        const key = `row_${id}_${column.name}`;
        const buttons = [];
        column.buttons.forEach((button, btnIndex) => {
            buttons.push(this.renderTableButton(it, button, rowIndex, colIndex, btnIndex));
        });

        const props = omit(column, ['value', 'label', 'name', 'className', 'path']);

        const tdClassNames = classNames({
            'text-right': true,
        });
        const divClassNames = classNames({
            [get(column, 'className', 'btn-group')]: true,
        });

        return (
            <td
                key={key}
                className={tdClassNames}
                {...props}
            >
                <div
                    className={divClassNames}
                >
                    { buttons }
                </div>
            </td>
        );
    }

    renderTableButton(it, button, rowIndex, colIndex, btnIndex) {
        const onClick = (e) => {
            if (this.onTableButtonClick) {
                this.onTableButtonClick(e, button, it, btnIndex);
            }

            if (this.props.onTableButtonClick) {
                this.props.onTableButtonClick(e, button, it, btnIndex);
            }
        };

        const className = get(button, 'className', 'btn btn-default');
        const type = get(button, 'type', 'button');
        const label = get(button, 'label', null);
        const children = get(button, 'children', null);
        const leftIcon = button.leftIcon ? this.renderTableButtonIcon(button.leftIcon) : null;
        const rightIcon = button.rightIcon ? this.renderTableButtonIcon(button.rightIcon) : null;

        const id = get(it, 'id', rowIndex);
        const key = `row_${id}_button_${btnIndex}`;

        if (type === 'link') {
            const href = get(button, 'href', '#').replace(/:[a-z][^/\s:]+/gi, (match) => {
                const hrefKey = match.replace(/^:/, '');
                const value = get(it, hrefKey, null);
                return value !== null ? value : match;
            });

            return (
                <a
                    key={key}
                    href={href}
                    className={className}
                    onClick={onClick}
                >
                    { leftIcon }
                    { label }
                    { children }
                    { rightIcon }
                </a>
            );
        }

        return (
            <button
                key={key}
                type={type}
                className={className}
                onClick={onClick}
            >
                { leftIcon }
                { label }
                { children }
                { rightIcon }
            </button>
        );
    }

    // eslint-disable-next-line class-methods-use-this
    renderTableButtonIcon(icon) {
        const iconClassName = `glyphicon glyphicon-${icon}`;
        return (
            <span
                className={iconClassName}
            />
        );
    }

    render() {
        const {
            items,
            cols,
        } = this.props;

        const containerClassNames = classNames({
            [styles.container]: true,
        });

        const itemsClassNames = classNames({
            [styles.items]: true,
        });

        return (
            <div className={containerClassNames}>
                <div className={itemsClassNames}>
                    { this.renderTable(cols, items) }
                </div>
            </div>
        );
    }
}

TableList.propTypes = propTypes;
TableList.defaultProps = defaultProps;

export default TableList;
