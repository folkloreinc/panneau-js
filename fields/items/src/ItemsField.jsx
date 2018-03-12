// eslint-disable jsx-a11y/href-no-hash react/no-array-index-key
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { SortableContainer, SortableElement, SortableHandle, arrayMove } from 'react-sortable-hoc';
import { FormGroup, FieldsGroup, AddButton } from '@panneau/field';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { defineMessages } from 'react-intl';

import ButtonGroup from './ButtonGroup';

import fieldClassNames from './styles.scss';

const messages = defineMessages({
    add: {
        id: 'fields.items.buttons.add',
        description: 'The label of the "add" button in items field',
        defaultMessage: 'Add',
    },
    addWithType: {
        id: 'fields.items.buttons.add_with_type',
        description: 'The label of the "add" button with type in items field',
        defaultMessage: 'Add {type}',
        values: {
            type: 'an item',
        },
    },
});

const ListItemButton = () => (
    <button type="button" className="btn btn-default">
        <span className="glyphicon glyphicon-resize-vertical" />
    </button>
);
const SortableListItemHandle = SortableHandle(ListItemButton);

const ListItemRender = ({ renderItem, value, itemIndex }) => renderItem(value, itemIndex);
const SortableListItemComponent = SortableElement(ListItemRender);

/* eslint-disable react/no-array-index-key */
const listItemSortablePropTypes = {
    items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    placeholder: PropTypes.node,
    renderItem: PropTypes.func.isRequired,
};
const listItemSortableDefaultProps = {
    placeholder: null,
};
const ListItemSortable = ({
    items, placeholder, renderItem, ...props
}) => (
    <div className="list" {...props}>
        {items.map((it, index) => (
            <SortableListItemComponent
                key={`item_${index}_${it.type}`}
                index={index}
                renderItem={renderItem}
                itemIndex={index}
                value={it}
            />
        ))}
        {placeholder}
    </div>
);
ListItemSortable.propTypes = listItemSortablePropTypes;
ListItemSortable.defaultProps = listItemSortableDefaultProps;
const SortableListComponent = SortableContainer(ListItemSortable);
/* eslint-enable react/no-array-index-key */

const propTypes = {
    name: PropTypes.string,
    value: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    label: PropTypes.string,
    helpText: PropTypes.string,

    types: PropTypes.arrayOf(PropTypes.shape({
        type: PropTypes.string,
        fields: PanneauPropTypes.fields,
    })),
    fields: PanneauPropTypes.fields,

    collapsible: PropTypes.bool,
    collapsed: PropTypes.bool,
    itemsCollapsible: PropTypes.bool,
    topElement: PropTypes.bool,
    sortable: PropTypes.bool,
    addButtonLabelPrefix: PropTypes.string, // @NOTE: Backward compatibility, remove in next minor
    addButtonLabel: PanneauPropTypes.message,
    addWithTypeButtonLabel: PanneauPropTypes.message,
    addButtonTypeLabel: PropTypes.string,
    addButtonLarge: PropTypes.bool,

    hasHeader: PropTypes.bool,
    hasAddButton: PropTypes.bool,
    hasRemoveButton: PropTypes.bool,
    headerButtons: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    confirmRemove: PropTypes.bool,
    confirmRemoveMessage: PropTypes.string,

    getItemProps: PropTypes.func,
    getNewItemValue: PropTypes.func,
    getItemTitle: PropTypes.func,
    getItemBefore: PropTypes.func,
    getItemBody: PropTypes.func,
    getItemValue: PropTypes.func,

    onChange: PropTypes.func,
    onClickHeaderButton: PropTypes.func,
};

const defaultProps = {
    name: 'fields',
    label: '',
    value: [],
    types: null,
    fields: null,
    helpText: null,

    collapsible: false,
    collapsed: false,
    itemsCollapsible: true,
    topElement: false,
    sortable: true,

    hasHeader: true,
    hasAddButton: true,
    hasRemoveButton: true,
    addButtonLabelPrefix: null, // @NOTE: Backward compatibility, remove in next minor
    addButtonLabel: messages.add,
    addWithTypeButtonLabel: messages.addWithType,
    addButtonTypeLabel: null,
    addButtonLarge: false,
    headerButtons: [],
    confirmRemove: true,
    confirmRemoveMessage: 'Êtes-vous certain de vouloir enlever cet élément?',

    getItemProps: null,
    getNewItemValue: null,
    getItemTitle: null,
    getItemBefore: null,
    getItemBody: null,
    getItemValue: null,

    onChange: null,
    onClickHeaderButton: null,
};

class ItemsField extends Component {
    constructor(props) {
        super(props);

        this.renderItem = this.renderItem.bind(this);
        this.onClickAdd = this.onClickAdd.bind(this);
        this.onClickRemove = this.onClickRemove.bind(this);
        this.onSortEnd = this.onSortEnd.bind(this);

        this.state = {
            collapsedItems: (props.value || []).map(() => true),
        };
    }

    componentWillReceiveProps(nextProps) {
        const valueChanged = nextProps.value !== this.props.value;
        if (valueChanged) {
            const currentValue = this.props.value || [];
            if (nextProps.value && nextProps.value.length > currentValue.length) {
                const delta = nextProps.value.length - currentValue.length;
                const collapsedItems = [].concat(this.state.collapsedItems);
                for (let i = 0; i < delta; i += 1) {
                    collapsedItems.push(false);
                }
                this.setState({
                    collapsedItems,
                });
            }
        }
    }

    onClickAdd(e, it) {
        e.preventDefault();
        this.addValue(it);
    }

    onClickRemove(e, index) {
        e.preventDefault();
        // eslint-disable-next-line no-alert
        if (this.props.confirmRemove && !window.confirm(this.props.confirmRemoveMessage)) {
            return;
        }
        const items = [].concat(this.props.value || []);
        items.splice(index, 1);
        this.triggerChange(items);
    }

    onItemChange(index, value) {
        const newValue = this.props.getItemValue
            ? this.props.getItemValue(index, value, this.props.value)
            : {
                ...this.props.value[index],
                ...value,
            };
        const newItems = [].concat(this.props.value);
        newItems[index] = newValue;
        this.triggerChange(newItems);
    }

    onClickCollapse(e, it, index) {
        const collapsedItems = [].concat(this.state.collapsedItems);
        collapsedItems[index] = !collapsedItems[index];
        this.setState({
            collapsedItems,
        });
    }

    onClickHeaderButton(e, button, buttonIndex, it, itemIndex) {
        if (this.props.onClickHeaderButton) {
            this.props.onClickHeaderButton(e, button, buttonIndex, it, itemIndex);
        }
    }

    onSortEnd({ oldIndex, newIndex }) {
        const items = [].concat(this.props.value || []);
        const newItems = arrayMove(items, oldIndex, newIndex);
        this.triggerChange(newItems);
    }

    getItemTitle(it, index) {
        if (this.props.getItemTitle) {
            return this.props.getItemTitle(it, index);
        }
        const { types } = this.props;
        const foundItem = types ? types.find(item => item.name === it.type) : null;
        if (foundItem) {
            return `#${index + 1} - ${foundItem.label}`;
        }
        return `Item #${index + 1}`;
    }

    getItemProps(it, index, props) {
        if (this.props.getItemProps) {
            return this.props.getItemProps(it, index, props);
        }
        return {};
    }

    addValue(it) {
        const newValue = [].concat(this.props.value || []);

        if (this.props.getNewItemValue) {
            const val = this.props.getNewItemValue(it);
            if (val !== null) {
                newValue.push(val);
            }
        } else {
            newValue.push(it
                ? {
                    type: it.value,
                }
                : {});
        }

        this.triggerChange(newValue);
    }

    triggerChange(newValue) {
        const currentValue = this.props.value || [];
        if (currentValue !== newValue) {
            const value = newValue;
            if (this.props.onChange) {
                this.props.onChange(value);
            }
        }
    }

    renderItemHeader(it, index) {
        const {
            hasHeader,
            hasRemoveButton,
            headerButtons,
            itemsCollapsible,
            sortable,
        } = this.props;

        const title = this.getItemTitle(it, index);
        const buttons = [].concat(headerButtons);

        const onClickCollapse = (e) => {
            e.preventDefault();
            this.onClickCollapse(e, it, index);
        };

        const onClickButton = (e, button, buttonIndex) => {
            this.onClickHeaderButton(e, button, buttonIndex, it, index);
        };

        if (sortable) {
            buttons.push(<SortableListItemHandle />);
        }

        if (hasRemoveButton) {
            buttons.push({
                icon: 'glyphicon glyphicon-remove',
                onClick: e => this.onClickRemove(e, index),
            });
        }

        let header;
        if (hasHeader) {
            const label = itemsCollapsible ? (
                <button type="button" className={fieldClassNames.button} onClick={onClickCollapse}>
                    <span className={fieldClassNames.icon}>
                        <span className="caret up" />
                    </span>
                    <span className={fieldClassNames.text}>{title}</span>
                </button>
            ) : (
                title
            );

            header = (
                <div className="panel-heading">
                    <div className={fieldClassNames.cols}>
                        <div className={fieldClassNames.col}>
                            <div className={fieldClassNames.title}>{label}</div>
                        </div>
                        <div
                            className={classNames({
                                [fieldClassNames.col]: true,
                                [fieldClassNames.right]: true,
                            })}
                        >
                            <div className="btn-group">
                                <ButtonGroup
                                    className="btn-group btn-group-xs"
                                    buttons={buttons}
                                    onClick={onClickButton}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            );
        } else {
            header = (
                <div className={fieldClassNames.actions}>
                    <ButtonGroup
                        className="btn-group btn-group-xs"
                        buttons={buttons}
                        onClick={onClickButton}
                    />
                </div>
            );
        }

        return header;
    }

    renderItem(it, index) {
        const {
            types, fields, value, itemsCollapsible, sortable,
        } = this.props;
        const { collapsedItems } = this.state;

        const key = !sortable ? `item_${index}_${it.type}` : null;
        const itemValue = value[index] || null;
        const type =
            types !== null
                ? types.find(obj => (obj.name || obj.type || obj.id) === it.type) || null
                : null;
        const typeFields = type !== null ? type.fields || fields : fields;
        const itemCollapsed = itemsCollapsible && (collapsedItems[index] || false);
        const onChange = val => this.onItemChange(index, val);

        const bodyStyle = {
            display: itemCollapsed ? 'none' : 'block',
        };

        const header = this.renderItemHeader(it, index);

        const body = this.props.getItemBody ? (
            this.props.getItemBody(it, index, itemCollapsed)
        ) : (
            <div
                className={classNames({
                    'panel-body': true,
                    [fieldClassNames.body]: true,
                })}
                style={bodyStyle}
            >
                <FieldsGroup value={itemValue} fields={typeFields || []} onChange={onChange} />
            </div>
        );

        let before;
        if (this.props.getItemBefore) {
            before = (
                <div className={fieldClassNames.before}>{this.props.getItemBefore(it, index)}</div>
            );
        }

        const itemClassNames = classNames({
            [fieldClassNames.item]: true,
            [fieldClassNames.collapsed]: itemCollapsed,
        });

        const panelClassNames = classNames({
            panel: true,
            'panel-default': true,
            [fieldClassNames.panel]: true,
        });

        return (
            <div className={itemClassNames} key={key}>
                {before}
                <div className={panelClassNames}>
                    {header}
                    {body}
                </div>
            </div>
        );
    }

    renderAddButton() {
        const {
            types,
            addButtonLabel,
            addWithTypeButtonLabel,
            addButtonLabelPrefix,
            addButtonLarge,
            topElement,
        } = this.props;

        const hasType = types !== null;
        const dropdownOptions = hasType
            ? types.map(obj => ({
                label: obj.label,
                value: (obj.name || obj.id || obj.type),
            }))
            : null;

        const buttonClassNames = classNames({
            btn: true,
            'btn-lg': addButtonLarge,
            'btn-primary': addButtonLarge,
            'btn-default': !addButtonLarge,
            'dropdown-toggle': types !== null && types.length,
        });

        const actionsClassNames = classNames({
            [fieldClassNames.actions]: true,
            [fieldClassNames.top]: topElement,
            [fieldClassNames.large]: addButtonLarge,
        });

        const intlLabel = hasType ? addWithTypeButtonLabel : addButtonLabel;
        const label = addButtonLabelPrefix !== null ? (
            `${addButtonLabelPrefix}${addButtonLabel}`
        ) : intlLabel;

        return (
            <div className={actionsClassNames}>
                <AddButton
                    label={label}
                    className={buttonClassNames}
                    dropdown={dropdownOptions}
                    onClick={this.onClickAdd}
                />
            </div>
        );
    }

    render() {
        const {
            name,
            hasAddButton,
            topElement,
            sortable,
            collapsible,
            collapsed,
            label,
            helpText,
        } = this.props;
        const value = this.props.value || [];
        const listProps = {};

        const formClassNames = classNames({
            [fieldClassNames.field]: true,
        });

        const boxStyle = {
            border: value.length === 0 && topElement ? 'dashed 1px #CCC' : '',
            width: '100%',
        };

        const placeholder =
            value.length === 0 && !topElement ? (
                <div className={fieldClassNames.placeholder} />
            ) : null;
        return (
            <FormGroup
                name={name}
                className={formClassNames}
                label={label}
                collapsible={collapsible}
                collapsed={collapsed}
                style={boxStyle}
                helpText={helpText}
            >
                {hasAddButton ? this.renderAddButton() : null}
                {sortable ? (
                    <SortableListComponent
                        {...listProps}
                        useDragHandle
                        lockAxis="y"
                        onSortEnd={this.onSortEnd}
                        items={value}
                        placeholder={placeholder}
                        renderItem={this.renderItem}
                    />
                ) : (
                    <div className="list" {...listProps}>
                        {value.map(this.renderItem)}
                        {placeholder}
                    </div>
                )}
            </FormGroup>
        );
    }
}

ItemsField.propTypes = propTypes;
ItemsField.defaultProps = defaultProps;

export default ItemsField;
