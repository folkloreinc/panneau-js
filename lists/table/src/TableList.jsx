import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import { pascal as pascalCase } from 'change-case';
import classNames from 'classnames';
import { ListActions, ListEmpty } from '@panneau/list';
import get from 'lodash/get';
import { PropTypes as PanneauPropTypes } from '@panneau/core';

import Column from './Column';

import styles from './styles.scss';

const propTypes = {
    items: PropTypes.arrayOf(PropTypes.object),
    striped: PropTypes.bool,
    hoverable: PropTypes.bool,
    responsive: PropTypes.bool,
    tableClassName: PropTypes.string,
    cols: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.required,
        label: PropTypes.string.required,
        path: PropTypes.string,
        type: PropTypes.string,
        width: PropTypes.number,
    })),
    emptyListText: PanneauPropTypes.message,
    onClickActions: PropTypes.func,
    onTableButtonClick: PropTypes.func,
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
    emptyListText: undefined,
    onClickActions: null,
    onTableButtonClick: null,
};

class TableList extends Component {
    constructor(props) {
        super(props);

        this.onClickActions = this.onClickActions.bind(this);
        this.renderTableHeader = this.renderTableHeader.bind(this);
        this.renderTableHeaderColumn = this.renderTableHeaderColumn.bind(this);
        this.renderTableBody = this.renderTableBody.bind(this);
        this.renderTableBodyRow = this.renderTableBodyRow.bind(this);
        this.renderTableBodyColumn = this.renderTableBodyColumn.bind(this);
        this.renderTableBodyButtonsColumn = this.renderTableBodyButtonsColumn.bind(this);
        this.renderTableBodyImageColumn = this.renderTableBodyImageColumn.bind(this);
        this.renderTableBodyActionsColumn = this.renderTableBodyActionsColumn.bind(this);
        this.renderTableButton = this.renderTableButton.bind(this);
        this.renderTableButtonIcon = this.renderTableButtonIcon.bind(this);
    }

    onClickActions(e, action, it, rowIndex) {
        if (this.props.onClickActions) {
            this.props.onClickActions(e, action, it, rowIndex);
        }
    }

    getTableBodyButtonsColumn(it, column, rowIndex, colIndex) {
        const id = get(it, 'id', rowIndex);
        const key = `row_${id}_${column.name}`;
        const buttons = [];
        column.buttons.forEach((button, btnIndex) => {
            buttons.push(this.renderTableButton(it, button, rowIndex, colIndex, btnIndex));
        });

        const props = TableList.getColumnProps(column);

        const tdClassNames = classNames({
            'text-right': true,
        });
        const divClassNames = classNames({
            [get(column, 'className', 'btn-group')]: true,
        });

        return (
            <td key={key} className={tdClassNames} {...props}>
                <div className={divClassNames}>{buttons}</div>
            </td>
        );
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
        } else if (typeof this.getTableHeaderColumn === 'function') {
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
        const columnMethodName = `renderTableBody${pascalCase(column.type)}Column`;
        if (typeof column.type !== 'undefined' && typeof this[columnMethodName] === 'function') {
            return this[columnMethodName](it, column, rowIndex, colIndex);
        }

        const id = get(it, 'id', rowIndex);
        const key = `row_${id}_${column.id}`;
        const data = get(it, column.path, null);

        return (
            <Column key={key} {...column}>
                {data}
            </Column>
        );
    }

    renderTableBodyButtonsColumn(it, column, rowIndex, colIndex) {
        const id = get(it, 'id', rowIndex);
        const key = `row_${id}_${column.name}`;
        const buttons = [];
        column.buttons.forEach((button, btnIndex) => {
            buttons.push(this.renderTableButton(it, button, rowIndex, colIndex, btnIndex));
        });

        const divClassNames = classNames({
            [get(column, 'className', 'btn-group')]: true,
        });

        return (
            <Column key={key} align="right" {...column}>
                <div className={divClassNames}>{buttons}</div>
            </Column>
        );
    }

    // eslint-disable-next-line class-methods-use-this
    renderTableBodyImageColumn(it, column, rowIndex) {
        const id = get(it, 'id', rowIndex);
        const key = `row_${id}_${column.id}`;
        const url = get(it, column.path, null);
        const width = column.width || null;

        return (
            <Column key={key} {...column}>
                {url !== null && !isEmpty(url) ? (
                    <img src={url} alt="" width={width} classNames={styles.image} />
                ) : null}
            </Column>
        );
    }

    renderTableBodyActionsColumn(it, column, rowIndex, colIndex) {
        const key = `row_${rowIndex}_${colIndex}_actions`;
        const {
            id, label, type, align, showAction, editAction, deleteAction, ...props
        } = column;
        const actionsProps = {
            show: showAction || null,
            edit: editAction || null,
            delete: deleteAction || null,
        };
        const actions = [...ListActions.getDefaultActions()].map(action =>
            ((actionsProps[action.id] || null) !== null
                ? {
                    ...action,
                    ...actionsProps[action.id],
                }
                : action));
        return (
            <Column key={key} align="right" {...column}>
                <ListActions
                    item={it}
                    onClick={(e, action) => this.onClickActions(e, action, it, rowIndex)}
                    actions={actions}
                    {...props}
                />
            </Column>
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
                <a key={key} href={href} className={className} onClick={onClick}>
                    {leftIcon}
                    {label}
                    {children}
                    {rightIcon}
                </a>
            );
        }

        return (
            <button key={key} type={type} className={className} onClick={onClick}>
                {leftIcon}
                {label}
                {children}
                {rightIcon}
            </button>
        );
    }

    // eslint-disable-next-line class-methods-use-this
    renderTableButtonIcon(icon) {
        const iconClassName = `glyphicon glyphicon-${icon}`;
        return <span className={iconClassName} />;
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

export default TableList;
