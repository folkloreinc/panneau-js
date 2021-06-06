/* eslint-disable react/no-array-index-key, react/jsx-props-no-spreading */

import React, { useCallback, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { v4 as uuid } from 'uuid';
import { ReactSortable } from 'react-sortablejs';
// import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';
import isFunction from 'lodash/isFunction';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretRight, faTimes } from '@fortawesome/free-solid-svg-icons';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useFieldComponent } from '@panneau/core/contexts';
import Button from '@panneau/element-button';
import Label from '@panneau/element-label';
import Dropdown from '@panneau/element-dropdown';

const propTypes = {
    name: PropTypes.string,
    value: PropTypes.arrayOf(PropTypes.any), // eslint-disable-line
    types: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string,
            name: PropTypes.string,
            fields: PanneauPropTypes.fields,
        }),
    ),
    newItemDefaultValue: PropTypes.func, // eslint-disable-line
    noItemLabel: PanneauPropTypes.label,
    addItemLabel: PanneauPropTypes.label,
    itemFieldLabel: PropTypes.oneOfType([PropTypes.func, PanneauPropTypes.label]),
    itemComponent: PropTypes.elementType,
    itemProps: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    itemFields: PanneauPropTypes.fields,
    className: PropTypes.string,
    onChange: PropTypes.func,

    renderBefore: PropTypes.func,
    renderItem: PropTypes.func,
    renderItemLabel: PropTypes.func,

    withoutCollapse: PropTypes.bool,
    withoutSort: PropTypes.bool,
    withFloatingAddButton: PropTypes.bool,

    inline: PropTypes.bool,
};

const defaultProps = {
    name: null,
    value: null,
    types: null,
    newItemDefaultValue: () => ({}),
    noItemLabel: (
        <FormattedMessage
            defaultMessage="No item..."
            description="Label when there is no item in items field"
        />
    ),
    addItemLabel: (
        <FormattedMessage defaultMessage="Add an item" description="Button label in items field" />
    ),
    // eslint-disable-next-line react/prop-types
    itemFieldLabel: ({ index }) => (
        <FormattedMessage
            defaultMessage="#{index}"
            description="Item label in items field"
            values={{ index }}
        />
    ),
    itemComponent: null,
    itemProps: null,
    itemFields: null,
    className: null,
    onChange: null,

    renderBefore: null,
    renderItem: null,
    renderItemLabel: null,

    withoutCollapse: false,
    withoutSort: false,
    withFloatingAddButton: false,

    inline: false,
};

const ItemsField = ({
    name,
    value,
    types,
    newItemDefaultValue,
    noItemLabel,
    addItemLabel,
    // eslint-disable-next-line no-unused-vars
    itemFieldLabel,
    itemComponent: ItemComponent,
    itemProps,
    itemFields,
    className,
    onChange,

    renderBefore,
    renderItem,
    renderItemLabel,

    withoutCollapse,
    withoutSort,
    withFloatingAddButton,

    inline,
}) => {
    const idMap = useRef((value || []).map(() => uuid()));
    const [collapsed, setCollapsed] = useState((value || []).map(() => true));
    const FieldsComponent = useFieldComponent('fields');

    const onClickAdd = useCallback(
        (newItemContent = null) => {
            const newValue =
                newItemContent !== null
                    ? { ...newItemDefaultValue(), ...newItemContent }
                    : newItemDefaultValue();
            const finalValue = [...(value || []), newValue];
            idMap.current = [...idMap.current, uuid()];
            setCollapsed((previousCollapsed) => [...previousCollapsed, false]);

            if (onChange !== null) {
                onChange(finalValue);
            }
        },
        [value, onChange, setCollapsed, newItemDefaultValue],
    );

    const onItemChange = useCallback(
        (it, index, newItemValue) => {
            const newValue = value.map((prevItem, prevIndex) =>
                prevIndex !== index ? prevItem : newItemValue,
            );
            if (onChange !== null) {
                onChange(newValue);
            }
        },
        [value, onChange],
    );

    const onClickRemove = useCallback(
        (e, it, index) => {
            e.preventDefault();
            e.stopPropagation();
            const newValue = [...value.slice(0, index), ...value.slice(index + 1)];
            if (onChange !== null) {
                onChange(newValue);
            }
            setCollapsed((previousCollapsed) =>
                previousCollapsed.filter((_, collapsedIndex) => collapsedIndex !== index),
            );
            idMap.current = idMap.current.filter((_, idIndex) => idIndex !== index);
        },
        [value, onChange, setCollapsed],
    );

    // eslint-disable-next-line no-unused-vars
    const toggleCollapse = useCallback(
        (index) => {
            setCollapsed((previousCollapsed) => {
                const newCollapsed = [...previousCollapsed];
                newCollapsed[index] = !newCollapsed[index];
                return newCollapsed;
            });
        },
        [setCollapsed],
    );

    const items = (value || []).map((it, index) => ({ id: idMap.current[index], it, index }));

    const sortList = useCallback(
        (newItems) => {
            const orderChanged = newItems.reduce(
                (changed, { index: newIndex }, prevIndex) => changed || prevIndex !== newIndex,
                false,
            );
            if (orderChanged && onChange !== null) {
                const newIdMap = newItems.map(({ index }) => idMap.current[index]);
                idMap.current = newIdMap;
                setCollapsed((prevCollapsed) => newItems.map(({ index }) => prevCollapsed[index]));
                onChange(newItems.map(({ it }) => it));
            }
        },
        [setCollapsed, onChange],
    );

    // Dropdown
    const [dropdownOpened, setDropdownOpened] = useState(false);
    const onClickDropdown = useCallback(
        (e) => {
            e.preventDefault();
            setDropdownOpened(!dropdownOpened);
        },
        [dropdownOpened, setDropdownOpened],
    );

    const itemElements = items.map(({ id, it }, index) => {
        const { type: itemType = null } = it || {};

        let itemChildren;
        const currentType = (types || []).find(({ id: typeId }) => itemType === typeId) || null;

        const renderedItemLabel = renderItemLabel !== null ? renderItemLabel(index) : null;

        const defaultItemLabel =
            currentType !== null ? (
                <span>
                    <Label>
                        {itemFieldLabel({ index: index + 1 })} - {currentType.name}
                    </Label>
                </span>
            ) : (
                <span>
                    <Label>{itemFieldLabel({ index: index + 1 })}</Label>
                </span>
            );

        if (itemType !== null && currentType === null) {
            itemChildren = (
                <FormattedMessage
                    defaultMessage="Could not find type for this item"
                    description="Error message"
                />
            );
        } else if (currentType !== null) {
            itemChildren = (
                <FieldsComponent
                    value={it}
                    onChange={(newValue) => onItemChange(it, index, newValue)}
                    fields={currentType.fields || itemFields}
                />
            );
        } else if (itemFields !== null) {
            itemChildren = (
                <FieldsComponent
                    value={it}
                    onChange={(newValue) => onItemChange(it, index, newValue)}
                    fields={itemFields}
                />
            );
        } else if (ItemComponent !== null) {
            itemChildren = (
                <ItemComponent
                    value={it}
                    onChange={(newValue) => onItemChange(it, index, newValue)}
                    {...(isFunction(itemProps) ? itemProps(it, index) : itemProps)}
                />
            );
        }

        return (
            <div
                className={classNames([
                    'mb-3',
                    'card',
                    {
                        inline,
                        show: !inline && !collapsed[index],
                    },
                ])}
                key={`item-${id}`}
            >
                {!inline ? (
                    <div className="card-header d-flex align-items-center justify-content-between">
                        <div className="card-content">
                            {!withoutCollapse ? (
                                <Button
                                    theme="secondary"
                                    size="sm"
                                    className="collapseToggle me-2"
                                    onClick={() => toggleCollapse(index)}
                                    outline
                                >
                                    <FontAwesomeIcon
                                        className="arrowIcon"
                                        icon={collapsed[index] ? faCaretRight : faCaretDown}
                                    />
                                </Button>
                            ) : null}
                            <span className="text-truncate">
                                {renderedItemLabel !== null ? renderedItemLabel : defaultItemLabel}
                            </span>
                        </div>
                        <div className="d-flex card-buttons">
                            <Button
                                theme="secondary"
                                size="sm"
                                onClick={(e) => onClickRemove(e, it, index)}
                                outline
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </Button>
                        </div>
                    </div>
                ) : null}
                <div
                    className={classNames([
                        'p-3',
                        {
                            collapse: !inline && !withoutCollapse && collapsed[index],
                        },
                    ])}
                >
                    <div className="row mx-n1">
                        <div className="col px-1">
                            {renderItem !== null
                                ? renderItem(it, index, {
                                      ...(isFunction(itemProps) ? itemProps(it, index) : itemProps),
                                      children: itemChildren,
                                      onChange: (newValue) => onItemChange(it, index, newValue),
                                  })
                                : itemChildren}
                        </div>
                    </div>
                </div>
                {inline ? (
                    <div className={classNames(['card-header', 'd-flex'])}>
                        <div className={classNames(['cardHeaderButtons', 'm-auto'])}>
                            <Button
                                theme="secondary"
                                size="sm"
                                onClick={(e) => onClickRemove(e, it, index)}
                                outline
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </Button>
                        </div>
                    </div>
                ) : null}
            </div>
        );
    });

    return (
        <div className={className}>
            <div
                className={classNames([
                    'd-flex',
                    'align-items-center',
                    'justify-content-between',
                    'pb-3',
                    'header',
                ])}
            >
                {!withFloatingAddButton ? <Label>{name}</Label> : null}
                {types !== null && types.length > 1 ? (
                    <div className="position-relative">
                        <Button
                            theme="primary"
                            outline
                            className={classNames([
                                {
                                    'dropdown-toggle': types !== null,
                                    [className]: className !== null,
                                },
                            ])}
                            onClick={types !== null ? onClickDropdown : null}
                        >
                            {addItemLabel}
                        </Button>
                        <Dropdown
                            items={types.map(({ id = null, name: typeName = null }) => ({
                                id,
                                label: typeName || 'label',
                                type: 'button',
                                onClick: () => {
                                    onClickAdd({ type: id });
                                    setDropdownOpened(false);
                                },
                            }))}
                            visible={dropdownOpened}
                            align="end"
                        />
                    </div>
                ) : null}
                {types !== null && types.length === 1 ? (
                    <Button
                        theme="primary"
                        outline
                        onClick={() => {
                            onClickAdd({
                                type: types[0].id || null,
                            });
                        }}
                        className="ms-auto"
                    >
                        {addItemLabel}
                    </Button>
                ) : null}
                {types === null || types.length === 0 ? (
                    <Button
                        theme="primary"
                        outline
                        onClick={() => onClickAdd()}
                        className="ms-auto"
                    >
                        {addItemLabel}
                    </Button>
                ) : null}
            </div>
            {renderBefore !== null ? renderBefore() : null}
            <div className="d-flex flex-column">
                {value !== null && value.length > 0 ? (
                    <div
                        className={classNames([
                            'list-group',
                            {
                                [className]: className !== null,
                            },
                        ])}
                    >
                        {!withoutSort ? (
                            <ReactSortable
                                list={items}
                                setList={sortList}
                                handle=".card-header"
                                direction={inline ? 'horizontal' : 'vertical'}
                            >
                                {itemElements}
                            </ReactSortable>
                        ) : (
                            itemElements
                        )}
                    </div>
                ) : (
                    <div className="card bg-light text-muted text-center">
                        <div className="card-body">
                            <Label>{noItemLabel}</Label>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

ItemsField.propTypes = propTypes;
ItemsField.defaultProps = defaultProps;

export default ItemsField;
