/* eslint-disable no-nested-ternary */

/* eslint-disable jsx-a11y/control-has-associated-label */

/* eslint-disable react/no-array-index-key, react/jsx-props-no-spreading, react/prop-types */
import { faCaretDown, faCaretRight, faGripLines, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import isFunction from 'lodash/isFunction';
import PropTypes from 'prop-types';
import React, { useCallback, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { ReactSortable } from 'react-sortablejs';
import { v4 as uuid } from 'uuid';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useFieldComponent } from '@panneau/core/contexts';
import { getPathValue } from '@panneau/core/utils';
import Button from '@panneau/element-button';
import Dropdown from '@panneau/element-dropdown';
import Label from '@panneau/element-label';

const propTypes = {
    label: PropTypes.string,
    value: PropTypes.arrayOf(PropTypes.any), // eslint-disable-line
    types: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string,
            name: PropTypes.string,
            fields: PanneauPropTypes.fields,
        }),
    ),
    newItemValue: PropTypes.oneOfType([PropTypes.func, PropTypes.any]),
    newItemValueWithUuid: PropTypes.bool,
    noItemLabel: PanneauPropTypes.label,
    addItemLabel: PanneauPropTypes.label,
    itemLabel: PanneauPropTypes.label,
    itemLabelPath: PropTypes.string,
    itemComponent: PropTypes.elementType,
    itemProps: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    itemFields: PanneauPropTypes.fields,
    itemField: PanneauPropTypes.field,
    className: PropTypes.string,
    onChange: PropTypes.func,
    renderBefore: PropTypes.func,
    renderItem: PropTypes.func,
    renderItemLabel: PropTypes.func,
    withoutCollapse: PropTypes.bool,
    withoutSort: PropTypes.bool,
    withoutCard: PropTypes.bool,
    withoutListGroup: PropTypes.bool,
    addItemDisabled: PropTypes.bool,
    inline: PropTypes.bool,
};

const defaultProps = {
    label: null,
    value: null,
    types: null,
    newItemValue: () => ({}),
    newItemValueWithUuid: false,
    noItemLabel: (
        <FormattedMessage
            defaultMessage="No item found."
            description="Label when there is no item in items field"
        />
    ),
    itemLabelPath: null,
    addItemLabel: (
        <FormattedMessage defaultMessage="Add an item" description="Button label in items field" />
    ),
    itemLabel: <FormattedMessage defaultMessage="Item" description="Items field's item label" />,
    itemComponent: null,
    itemProps: null,
    itemFields: null,
    itemField: null,
    className: null,
    onChange: null,
    renderBefore: null,
    renderItem: null,
    renderItemLabel: null,
    withoutListGroup: false,
    withoutCollapse: false,
    withoutSort: false,
    withoutCard: false,
    addItemDisabled: false,
    inline: false,
};

const ItemsField = ({
    label,
    value,
    types,
    newItemValue,
    newItemValueWithUuid,
    noItemLabel,
    addItemLabel,
    itemLabel,
    itemLabelPath,
    itemComponent: ItemComponent,
    itemProps,
    itemFields,
    itemField,
    className,
    onChange,
    renderBefore,
    renderItem,
    renderItemLabel,
    withoutListGroup,
    withoutCollapse,
    withoutSort,
    withoutCard,
    addItemDisabled,
    inline,
}) => {
    const hasTypes = types !== null;
    const idMap = useRef((value || []).map(() => uuid()));
    const [collapsed, setCollapsed] = useState((value || []).map(() => true));
    const { component = null, ...fieldProps } = itemField || {};
    const FieldsComponent = useFieldComponent('fields');
    const FieldComponent = useFieldComponent(component);

    const onClickAdd = useCallback(
        (newItemContent = null) => {
            const newId = uuid();
            const defaultValue = isFunction(newItemValue) ? newItemValue() : newItemValue;
            let newValue =
                newItemContent !== null ? { ...defaultValue, ...newItemContent } : defaultValue;
            if (newItemValueWithUuid) {
                newValue = newValue !== null ? { ...newValue, id: newId } : { id: newId };
            }

            const finalValue = [...(value || []), newValue];
            idMap.current = [...idMap.current, newId];
            setCollapsed((previousCollapsed) => [...previousCollapsed, false]);

            if (onChange !== null) {
                onChange(finalValue);
            }
        },
        [value, onChange, setCollapsed, newItemValue, newItemValueWithUuid],
    );

    const onItemChange = useCallback(
        (it, index, newValue) => {
            const finalValue = value.map((prevItem, prevIndex) =>
                prevIndex !== index ? prevItem : newValue,
            );
            if (onChange !== null) {
                onChange(finalValue);
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
                // console.log('Change', newItems, newIdMap); // eslint-disable-line
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
            e.stopPropagation();
            setDropdownOpened((opened) => !opened);
        },
        [setDropdownOpened],
    );

    const onDropdownClickOutside = useCallback(() => {
        setDropdownOpened(false);
    }, [setDropdownOpened]);

    // console.log('value, items', value, items); // eslint-disable-line

    const itemElements = items.map(({ id, it }, index) => {
        const { type: itemType = null } = it || {};
        // console.log(id, it); // eslint-disable-line

        let itemChildren;
        // Assumes the type on an item is the type you want for the dropdown
        const currentType = (types || []).find(({ id: typeId }) => itemType === typeId) || null;

        const renderedItemLabel = renderItemLabel !== null ? renderItemLabel(index) : null;
        const basicItemLabel = <Label>{itemLabel}</Label>;

        const defaultItemLabel =
            currentType !== null ? (
                <span>
                    {basicItemLabel}
                    {itemLabel !== null ? ' ' : null}
                    {`#${index + 1}`} - {currentType.name}
                </span>
            ) : (
                <span>
                    {basicItemLabel}
                    {itemLabel !== null ? ' ' : null}
                    {`#${index + 1}`}
                </span>
            );

        const labelPathValue = getPathValue(it, itemLabelPath);
        const finalItemLabel = labelPathValue !== null ? labelPathValue : defaultItemLabel;
        const finalRenderedItemLabel =
            renderedItemLabel !== null ? renderedItemLabel : finalItemLabel;

        if (ItemComponent !== null) {
            itemChildren = (
                <ItemComponent
                    value={it}
                    onChange={(newValue) => onItemChange(it, index, newValue)}
                    {...(isFunction(itemProps) ? itemProps(it, index) : itemProps)}
                />
            );
        } else if (FieldComponent !== null) {
            itemChildren = (
                <FieldComponent
                    value={it}
                    onChange={(newValue) => onItemChange(it, index, newValue)}
                    {...fieldProps}
                    {...(isFunction(itemProps) ? itemProps(it, index) : itemProps)}
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
        } else if (currentType !== null) {
            itemChildren = (
                <FieldsComponent
                    value={it}
                    onChange={(newValue) => onItemChange(it, index, newValue)}
                    fields={currentType.fields || itemFields}
                />
            );
        } else if (hasTypes && itemType !== null && currentType === null) {
            itemChildren = (
                <FormattedMessage
                    defaultMessage="Could not find type for this item"
                    description="Error message"
                />
            );
        }

        const isCollapsed = !inline && !withoutCollapse && collapsed[index];

        return (
            <div
                className={classNames([
                    {
                        'mb-3': !withoutCard,
                        card: !withoutCard,
                        'd-inline-flex flex-row': inline || withoutCard,
                        'list-group-item': withoutCard && !withoutListGroup,
                        show: !inline && !collapsed[index],
                    },
                ])}
                key={`item-${id}`}
            >
                {!inline && !withoutCard ? (
                    <div
                        className={classNames([
                            'card-header',
                            'd-flex',
                            'align-items-center',
                            {
                                'border-bottom-0': collapsed[index],
                            },
                        ])}
                    >
                        {!withoutCollapse ? (
                            <button
                                type="button"
                                className="btn position-absolute top-0 start-0 w-100 h-100"
                                onClick={() => toggleCollapse(index)}
                            />
                        ) : null}
                        <div className="card-content position-relative pe-none text-truncate">
                            {!withoutCollapse ? (
                                <FontAwesomeIcon
                                    style={{ width: 20 }}
                                    className="me-1"
                                    icon={collapsed[index] ? faCaretRight : faCaretDown}
                                />
                            ) : null}
                            <span className="text-truncate">{finalRenderedItemLabel}</span>
                        </div>
                        <div className="d-flex card-buttons position-relative ms-auto">
                            {!withoutSort ? (
                                <Button className="p-0 me-2" theme="secondary" size="sm" outline>
                                    <div className="py-1 px-2">
                                        <FontAwesomeIcon icon={faGripLines} />
                                    </div>
                                </Button>
                            ) : null}
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
                        'position-relative',
                        {
                            'p-2': !withoutCard,
                            'flex-grow-1': inline || withoutCard,
                            collapse: isCollapsed,
                        },
                    ])}
                >
                    {!isCollapsed
                        ? renderItem !== null
                            ? renderItem(it, index, {
                                  ...(isFunction(itemProps) ? itemProps(it, index) : itemProps),
                                  children: itemChildren,
                                  onChange: (newValue) => onItemChange(it, index, newValue),
                              })
                            : itemChildren
                        : null}
                </div>
                {inline || withoutCard ? (
                    <div
                        className={classNames([
                            {
                                'card-header': !withoutCard,
                                'd-flex': true,
                                'border-bottom-0': !withoutCard,
                                'ps-2': withoutCard,
                            },
                        ])}
                    >
                        <Button
                            theme="secondary"
                            size="sm"
                            className="m-auto"
                            onClick={(e) => onClickRemove(e, it, index)}
                            outline
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </Button>
                    </div>
                ) : null}
            </div>
        );
    });

    return (
        <div className={className}>
            <div className={classNames(['d-flex', 'align-items-center', 'pb-3', 'header'])}>
                {label !== null ? <Label>{label}</Label> : null}
                {hasTypes && types.length > 1 ? (
                    <div className="position-relative ms-auto">
                        <Button
                            theme="primary"
                            outline
                            className={classNames([
                                {
                                    'dropdown-toggle': hasTypes,
                                    [className]: className !== null,
                                },
                            ])}
                            onClick={onClickDropdown}
                        >
                            <Label>{addItemLabel}</Label>
                        </Button>
                        <Dropdown
                            onClickOutside={onDropdownClickOutside}
                            items={types.map(({ id = null, name: typeName = null }) => ({
                                id,
                                label: typeName || 'label',
                                type: 'button',
                                disabled: addItemDisabled,
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
                {hasTypes && types.length === 1 ? (
                    <Button
                        theme="primary"
                        outline
                        disabled={addItemDisabled}
                        onClick={() => {
                            onClickAdd({
                                type: types[0].id || null,
                            });
                        }}
                        className="ms-auto"
                    >
                        <Label>{addItemLabel}</Label>
                    </Button>
                ) : null}
                {!hasTypes || types.length === 0 ? (
                    <Button
                        theme="primary"
                        outline
                        disabled={addItemDisabled}
                        onClick={() => onClickAdd()}
                        className="ms-auto"
                    >
                        <Label>{addItemLabel}</Label>
                    </Button>
                ) : null}
            </div>
            {renderBefore !== null ? renderBefore() : null}
            <div className="d-flex flex-column mb-3">
                {value !== null && value.length > 0 ? (
                    <div
                        className={classNames([
                            {
                                'list-group': withoutSort && !withoutListGroup,
                                [className]: className !== null,
                            },
                        ])}
                    >
                        {!withoutSort ? (
                            <ReactSortable
                                list={items}
                                setList={sortList}
                                handle=".card-header"
                                className={classNames([
                                    {
                                        'list-group': !withoutSort && !withoutListGroup,
                                    },
                                ])}
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
