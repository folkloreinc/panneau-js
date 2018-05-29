// eslint-disable jsx-a11y/href-no-hash react/no-array-index-key
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import isObject from 'lodash/isObject';
import isArray from 'lodash/isArray';
import { arrayMove } from 'react-sortable-hoc';
import { FormGroup, FieldsGroup, AddButton, ButtonGroup } from '@panneau/field';
import { getJSON, PropTypes as PanneauPropTypes } from '@panneau/core';
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';

import SortableHandle from './SortableHandle';
import SortableList from './SortableList';

import styles from './styles.scss';

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
    },
    title: {
        id: 'fields.items.title',
        description: 'The title of each item',
        defaultMessage: 'Item #{index}',
    },
    titleWithLabel: {
        id: 'fields.items.title_with_label',
        description: 'The title of each item with a label',
        defaultMessage: 'Item #{index} - {label}',
    },
});

const propTypes = {
    intl: PropTypes.shape({
        formatMessage: PropTypes.func.isRequired,
    }).isRequired,

    name: PropTypes.string,
    value: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    label: PanneauPropTypes.label,
    helpText: PropTypes.string,

    types: PropTypes.arrayOf(PropTypes.shape({
        type: PropTypes.string,
        name: PropTypes.string,
        id: PropTypes.string,
        fields: PanneauPropTypes.fields.isRequired,
    })),
    fields: PanneauPropTypes.fields,
    typesEndpoint: PropTypes.string,
    fieldsEndpoint: PropTypes.string,
    FieldComponent: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),

    collapsible: PropTypes.bool,
    collapsed: PropTypes.bool,
    itemsCollapsible: PropTypes.bool,
    topElement: PropTypes.bool,
    sortable: PropTypes.bool,
    itemTitle: PanneauPropTypes.message,
    itemTitleWithLabel: PanneauPropTypes.message,

    addButtonLabelPrefix: PropTypes.string, // @NOTE: Backward compatibility, remove in next minor
    addButtonLabel: PanneauPropTypes.message,
    addWithTypeButtonLabel: PanneauPropTypes.message,
    addButtonTypeLabel: PanneauPropTypes.message,
    addButtonLarge: PropTypes.bool,

    withoutPanel: PropTypes.bool,
    withoutHeader: PropTypes.bool,
    withoutBorder: PropTypes.bool,
    withoutAddButton: PropTypes.bool,
    withoutRemoveButton: PropTypes.bool,

    headerButtons: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    confirmRemove: PropTypes.bool,
    confirmRemoveMessage: PropTypes.string,

    renderItemField: PropTypes.func,
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
    typesEndpoint: null,
    fieldsEndpoint: null,
    FieldComponent: null,
    helpText: null,

    collapsible: false,
    collapsed: false,
    itemsCollapsible: true,
    topElement: false,
    sortable: true,
    itemTitle: messages.title,
    itemTitleWithLabel: messages.titleWithLabel,

    withoutPanel: false,
    withoutHeader: false,
    withoutBorder: false,
    withoutAddButton: false,
    withoutRemoveButton: false,

    addButtonLabelPrefix: null, // @NOTE: Backward compatibility, remove in next minor
    addButtonLabel: messages.add,
    addWithTypeButtonLabel: messages.addWithType,
    addButtonTypeLabel: null,
    addButtonLarge: false,
    headerButtons: [],
    confirmRemove: true,
    confirmRemoveMessage: 'Êtes-vous certain de vouloir enlever cet élément?',

    renderItemField: null,
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
        this.onTypesLoaded = this.onTypesLoaded.bind(this);
        this.onFieldsLoaded = this.onFieldsLoaded.bind(this);
        this.onClickAdd = this.onClickAdd.bind(this);
        this.onClickRemove = this.onClickRemove.bind(this);
        this.onSortEnd = this.onSortEnd.bind(this);

        this.state = {
            types: props.types,
            fields: props.fields,
            collapsedItems: (props.value || []).map(() => true),
        };
    }

    componentDidMount() {
        const { typesEndpoint, fieldsEndpoint } = this.props;
        const { types, fields } = this.state;
        if (types === null && typesEndpoint !== null) {
            this.loadTypes();
        } else if (fields === null && fieldsEndpoint !== null) {
            this.loadFields();
        }
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

        const typesChanged = nextProps.types !== this.props.types;
        if (typesChanged) {
            this.setState({
                types: nextProps.types,
            });
        }

        const fieldsChanged = nextProps.fields !== this.props.fields;
        if (fieldsChanged) {
            this.setState({
                fields: nextProps.fields,
            });
        }
    }

    componentDidUpdate(prevProps, prevState) {
        const { typesEndpoint, fieldsEndpoint } = this.props;
        const typesChanged = prevState.types !== this.state.types;
        const fieldsChanged = prevState.fields !== this.state.fields;
        if (typesChanged && this.state.types === null && typesEndpoint !== null) {
            this.loadTypes();
        } else if (fieldsChanged && this.state.fields === null && fieldsEndpoint !== null) {
            this.loadFields();
        }
    }

    onTypesLoaded(types) {
        this.setState({
            types,
        });
    }

    onFieldsLoaded(fields) {
        this.setState({
            fields: !isArray(fields) ? fields.fields : fields,
        });
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
        e.preventDefault();
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
        const { itemTitle, itemTitleWithLabel } = this.props;
        const { types } = this.state;
        // @NOTE: For backward compatibility. `id` should be used in the future
        const foundType =
            types !== null
                ? types.find(item => (item.type || item.name || item.id || null) === it.type)
                : null;
        if (this.props.getItemTitle) {
            return this.props.getItemTitle(it, index, foundType);
        }
        const label = foundType !== null ? foundType.label : null;
        return (
            <FormattedMessage
                {...(label !== null ? itemTitleWithLabel : itemTitle)}
                values={{
                    index: index + 1,
                    label,
                }}
            />
        );
    }

    getItemProps(it, index, props) {
        if (this.props.getItemProps) {
            return this.props.getItemProps(it, index, props);
        }
        return {};
    }

    loadTypes() {
        const { typesEndpoint } = this.props;
        getJSON(typesEndpoint, {
            credentials: 'include',
        }).then(this.onTypesLoaded);
    }

    loadFields() {
        const { fieldsEndpoint } = this.props;
        getJSON(fieldsEndpoint, {
            credentials: 'include',
        }).then(this.onFieldsLoaded);
    }

    addValue(it) {
        const newValue = [].concat(this.props.value || []);
        const type = it || null;
        if (this.props.getNewItemValue) {
            const val = this.props.getNewItemValue(type);
            newValue.push(val);
        } else {
            newValue.push(type !== null
                ? {
                    type: type.value,
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

    renderItemActions(it, index) {
        const { headerButtons, withoutRemoveButton, sortable } = this.props;
        const buttons = [].concat(headerButtons);

        const buttonClassName = classNames({
            'btn-outline-secondary': true,
            [styles.button]: true,
        });

        if (sortable) {
            buttons.push(<SortableHandle className={buttonClassName} />);
        }

        if (!withoutRemoveButton) {
            buttons.push({
                icon: 'fas fa-times',
                onClick: e => this.onClickRemove(e, index),
            });
        }

        return (
            <div className={styles.actions}>
                <ButtonGroup
                    className={classNames({
                        'btn-group-sm': true,
                        [styles.buttonGroup]: true,
                    })}
                    buttonClassName={buttonClassName}
                    noWrap
                    buttons={buttons}
                    onClick={(e, button, buttonIndex) =>
                        this.onClickHeaderButton(e, button, buttonIndex, it, index)
                    }
                />
            </div>
        );
    }

    renderItemBefore(it, index) {
        const { getItemBefore } = this.props;
        return getItemBefore !== null ? (
            <div className={styles.before}>{getItemBefore(it, index)}</div>
        ) : null;
    }

    renderItemTitle(it, index, collapsed) {
        const { itemsCollapsible } = this.props;
        const title = this.getItemTitle(it, index);
        return itemsCollapsible ? (
            <button
                type="button"
                className={classNames({
                    btn: true,
                    [styles.button]: true,
                })}
                onClick={e => this.onClickCollapse(e, it, index)}
            >
                <span className={styles.icon}>
                    <span
                        className={classNames({
                            fas: true,
                            'fa-caret-right': collapsed,
                            'fa-caret-down': !collapsed,
                        })}
                    />
                </span>
                <span className={styles.text}>{title}</span>
            </button>
        ) : (
            title
        );
    }

    renderItemHeader(it, index, collapsed) {
        const { withoutPanel } = this.props;
        const title = this.renderItemTitle(it, index, collapsed);
        const actions = this.renderItemActions(it, index, collapsed);

        const headerClassNames = classNames({
            'card-header': !withoutPanel,
            [styles.header]: true,
        });

        return (
            <div className={headerClassNames}>
                <div className="row">
                    <div className="col">
                        <div className={styles.title}>{title}</div>
                    </div>
                    <div className="col text-right">{actions}</div>
                </div>
            </div>
        );
    }

    renderItemField(it, index, collapsed) {
        const { value, renderItemField, FieldComponent } = this.props;
        const { types, fields } = this.state;

        const itemValue = value[index] || null;
        const type =
            types !== null
                ? types.find(obj => (obj.name || obj.type || obj.id) === it.type) || null
                : null;
        const typeFields = type !== null ? type.fields || fields : fields;

        if (renderItemField !== null) {
            return renderItemField(it, index, {
                collapsed,
                value: itemValue,
                fields: typeFields || [],
                onChange: val => this.onItemChange(index, val),
            });
        }

        return FieldComponent !== null ? (
            <FieldComponent
                value={itemValue}
                fields={typeFields || []}
                onChange={val => this.onItemChange(index, val)}
            />
        ) : (
            <FieldsGroup
                value={itemValue}
                fields={typeFields || []}
                onChange={val => this.onItemChange(index, val)}
            />
        );
    }

    renderItemBody(it, index, collapsed) {
        const { withoutPanel, getItemBody } = this.props;

        const field = this.renderItemField(it, index, collapsed);

        const bodyClassNames = classNames({
            'card-body': !withoutPanel,
            [styles.body]: true,
        });

        const bodyStyle = {
            display: collapsed ? 'none' : 'block',
        };

        return getItemBody !== null ? (
            getItemBody(it, index, collapsed, field)
        ) : (
            <div className={bodyClassNames} style={bodyStyle}>
                {field}
            </div>
        );
    }

    renderItem(it, index) {
        const {
            withoutHeader,
            withoutPanel,
            withoutBorder,
            itemsCollapsible,
            sortable,
        } = this.props;
        const { collapsedItems } = this.state;

        const key = !sortable ? `item_${index}_${it.type}` : null;
        const itemCollapsed =
            !withoutPanel && !withoutHeader && itemsCollapsible && (collapsedItems[index] || false);

        const before = this.renderItemBefore(it, index, itemCollapsed);
        const header = !withoutHeader ? this.renderItemHeader(it, index, itemCollapsed) : null;
        const actions = withoutHeader ? this.renderItemActions(it, index, itemCollapsed) : null;
        const body = this.renderItemBody(it, index, itemCollapsed);

        const panelClassNames = classNames({
            card: !withoutPanel,
            [styles.panel]: true,
            [styles.withBorder]: withoutPanel && !withoutBorder,
        });

        return (
            <div
                className={classNames({
                    [styles.item]: true,
                    [styles.collapsed]: itemCollapsed,
                })}
                key={key}
            >
                {before}
                {withoutHeader ? (
                    <div className={panelClassNames}>
                        <div className={styles.cols}>
                            <div
                                className={classNames({
                                    [styles.col]: true,
                                    [styles.colBody]: true,
                                })}
                            >
                                {body}
                            </div>
                            <div
                                className={classNames({
                                    [styles.col]: true,
                                    [styles.colActions]: true,
                                })}
                            >
                                {actions}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className={panelClassNames}>
                        {header}
                        {body}
                    </div>
                )}
            </div>
        );
    }

    renderAddButton() {
        const {
            addButtonLabel,
            addWithTypeButtonLabel,
            addButtonLabelPrefix,
            addButtonLarge,
            addButtonTypeLabel,
            topElement,
            intl,
        } = this.props;
        const { types } = this.state;

        const hasType = types !== null;
        const dropdownOptions = hasType
            ? types.map(obj => ({
                label: obj.label,
                value: obj.name || obj.id || obj.type,
            }))
            : null;

        const buttonClassNames = classNames({
            btn: true,
            'btn-lg': addButtonLarge,
            'btn-primary': true,
            'dropdown-toggle': types !== null && types.length,
        });

        const actionsClassNames = classNames({
            [styles.actions]: true,
            [styles.main]: true,
            [styles.top]: topElement,
            [styles.large]: addButtonLarge,
        });

        const intlLabel = addButtonTypeLabel !== null ? addWithTypeButtonLabel : addButtonLabel;
        const label =
            addButtonLabelPrefix !== null ? `${addButtonLabelPrefix}${addButtonLabel}` : intlLabel;

        return (
            <div className={actionsClassNames}>
                <AddButton
                    label={
                        isObject(label)
                            ? {
                                values: {
                                    type: isObject(addButtonTypeLabel)
                                        ? intl.formatMessage(addButtonTypeLabel)
                                        : addButtonTypeLabel,
                                },
                                ...label,
                            }
                            : label
                    }
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
            withoutAddButton,
            topElement,
            sortable,
            collapsible,
            collapsed,
            label,
            helpText,
        } = this.props;
        const value = this.props.value || [];

        const formClassNames = classNames({
            [styles.field]: true,
        });

        const boxStyle = {
            border: value.length === 0 && topElement ? 'dashed 1px #CCC' : '',
            width: '100%',
        };

        const placeholder =
            value.length === 0 && !topElement ? <div className={styles.placeholder} /> : null;
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
                {!withoutAddButton ? this.renderAddButton() : null}
                {sortable ? (
                    <div className={styles.list}>
                        <SortableList
                            useDragHandle
                            lockAxis="y"
                            onSortEnd={this.onSortEnd}
                            items={value}
                            placeholder={placeholder}
                            renderItem={this.renderItem}
                        />
                    </div>
                ) : (
                    <div className={styles.list}>
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

export default injectIntl(ItemsField);
