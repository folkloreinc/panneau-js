// eslint-disable jsx-a11y/href-no-hash react/no-array-index-key
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import isObject from 'lodash/isObject';
import isArray from 'lodash/isArray';
import arrayMove from 'array-move';
import {
    FormGroup, FieldsGroup, AddButton, ButtonGroup,
} from '@panneau/field';
import { getJSON, isMessage, PropTypes as PanneauPropTypes } from '@panneau/core';
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
    confirmRemoveMessage: {
        id: 'fields.items.confirm_remove_message',
        description: 'The confirmation message when removing an element',
        defaultMessage: 'Are you sure you want to remove this element?',
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

    types: PropTypes.arrayOf(
        PropTypes.shape({
            type: PropTypes.string,
            name: PropTypes.string,
            id: PropTypes.string,
            fields: PanneauPropTypes.fields.isRequired,
        }),
    ),
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
    confirmRemoveMessage: PanneauPropTypes.message,

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
    confirmRemoveMessage: messages.confirmRemoveMessage,

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
    static getDerivedStateFromProps(
        { value: nextValue, types: nextTypes, fields: nextFields },
        {
            value, types, fields, collapsedItems,
        },
    ) {
        const valueChanged = nextValue !== value;
        const typesChanged = nextTypes !== types && nextTypes !== null && types === null;
        const fieldsChanged = nextFields !== fields && nextFields !== null && fields === null;
        if (valueChanged || typesChanged || fieldsChanged) {
            return {
                types: typesChanged ? nextTypes : types,
                fields: fieldsChanged ? nextFields : fields,
                collapsedItems:
                    nextValue !== null && nextValue.length > collapsedItems.length
                        ? [
                            ...collapsedItems,
                            ...new Array(nextValue.length - collapsedItems.length).map(
                                () => false,
                            ),
                        ]
                        : collapsedItems,
            };
        }
        return null;
    }

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
            changes: 0,
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

    componentDidUpdate(prevProps, { types: prevTypes, fields: prevFields }) {
        const { typesEndpoint, fieldsEndpoint } = this.props;
        const { types, fields } = this.state;
        const typesChanged = prevTypes !== types;
        const fieldsChanged = prevFields !== fields;
        if (typesChanged && types === null && typesEndpoint !== null) {
            this.loadTypes();
        } else if (fieldsChanged && fields === null && fieldsEndpoint !== null) {
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
        const {
            value, intl, confirmRemove, confirmRemoveMessage,
        } = this.props;
        const confirmMessage = isMessage(confirmRemoveMessage)
            ? intl.formatMessage(confirmRemoveMessage)
            : confirmRemoveMessage;
        // eslint-disable-next-line no-alert
        if (confirmRemove && !window.confirm(confirmMessage)) {
            return;
        }
        const currentValue = value || [];
        this.triggerChange([...currentValue.slice(0, index), ...currentValue.slice(index + 1)]);
    }

    onItemChange(index, itemValue) {
        const { value, getItemValue } = this.props;
        const currentValue = value || [];
        const newItemValue = getItemValue
            ? getItemValue(index, itemValue, currentValue)
            : {
                ...(currentValue[index] || null),
                ...itemValue,
            };
        this.triggerChange([
            ...currentValue.slice(0, index),
            newItemValue,
            ...currentValue.slice(index + 1),
        ]);
    }

    onClickCollapse(e, it, index) {
        e.preventDefault();
        this.setState(({ collapsedItems }) => ({
            collapsedItems: [
                ...collapsedItems.slice(0, index),
                !collapsedItems[index],
                ...collapsedItems.slice(index + 1),
            ],
        }));
    }

    onClickHeaderButton(e, button, buttonIndex, it, itemIndex) {
        const { onClickHeaderButton } = this.props;
        if (onClickHeaderButton !== null) {
            onClickHeaderButton(e, button, buttonIndex, it, itemIndex);
        }
    }

    onSortEnd({ oldIndex, newIndex }) {
        const { value } = this.props;
        const currentValue = value || [];
        const newValue = arrayMove(currentValue, oldIndex, newIndex);
        this.triggerChange(newValue);

        this.setState(({ collapsedItems, changes }) => ({
            collapsedItems: arrayMove(collapsedItems, oldIndex, newIndex),
            changes: changes + 1,
        }));
    }

    getItemTitle(it, index) {
        const { itemTitle, itemTitleWithLabel, getItemTitle } = this.props;
        const { types } = this.state;
        // @NOTE: For backward compatibility. `id` should be used in the future
        const foundType = types !== null
            ? types.find(item => (item.type || item.name || item.id || null) === it.type)
            : null;
        if (getItemTitle !== null) {
            return getItemTitle(it, index, foundType);
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
        const { getItemProps } = this.props;
        if (getItemProps !== null) {
            return getItemProps(it, index, props);
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
        const { value, getNewItemValue } = this.props;
        const newValue = [].concat(value || []);
        const type = it || null;
        if (getNewItemValue !== null) {
            const val = getNewItemValue(type);
            newValue.push(val);
        } else {
            newValue.push(
                type !== null
                    ? {
                        type: type.value,
                    }
                    : {},
            );
        }

        this.triggerChange(newValue);
    }

    triggerChange(newValue) {
        const { value: currentValue, onChange } = this.props;
        if (currentValue !== newValue) {
            const value = newValue;
            if (onChange !== null) {
                onChange(value);
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
                    onClick={(...args) => this.onClickHeaderButton(...args, it, index)}
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
        const { types, fields, changes } = this.state;

        const itemValue = value[index] || null;
        const type = types !== null
            ? types.find(obj => (obj.name || obj.type || obj.id) === it.type) || null
            : null;
        const typeFields = type !== null ? type.fields || fields : fields;

        const itemIndex = `${index}-${changes}`;

        if (renderItemField !== null) {
            return renderItemField(it, index, {
                collapsed,
                value: itemValue,
                fields: typeFields || [],
                onChange: val => this.onItemChange(index, val),
                itemIndex,
            });
        }

        return FieldComponent !== null ? (
            <FieldComponent
                value={itemValue}
                fields={typeFields || []}
                onChange={val => this.onItemChange(index, val)}
                itemIndex={itemIndex}
            />
        ) : (
            <FieldsGroup
                value={itemValue}
                fields={typeFields || []}
                onChange={val => this.onItemChange(index, val)}
                itemIndex={itemIndex}
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
        // prettier-ignore
        const itemCollapsed = (!withoutPanel
                && !withoutHeader
                && itemsCollapsible
                && (collapsedItems[index] || false)
        );

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
        const label = addButtonLabelPrefix !== null ? `${addButtonLabelPrefix}${addButtonLabel}` : intlLabel;

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
            value,
        } = this.props;
        const finalValue = value || [];

        const formClassNames = classNames({
            [styles.field]: true,
        });

        const boxStyle = {
            border: finalValue.length === 0 && topElement ? 'dashed 1px #CCC' : '',
            width: '100%',
        };

        // prettier-ignore
        const placeholder = (finalValue.length === 0 && !topElement
            ? <div className={styles.placeholder} />
            : null);
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
                            items={finalValue}
                            placeholder={placeholder}
                            renderItem={this.renderItem}
                        />
                    </div>
                ) : (
                    <div className={styles.list}>
                        {finalValue.map(this.renderItem)}
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
