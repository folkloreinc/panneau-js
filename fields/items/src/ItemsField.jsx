/* eslint-disable react/no-array-index-key, react/jsx-props-no-spreading, react/prop-types */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { ReactSortable } from 'react-sortablejs';
import { v4 as uuid } from 'uuid';
import classNames from 'classnames';
import isFunction from 'lodash/isFunction';
import { faCaretDown, faCaretRight, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useFieldComponent } from '@panneau/core/contexts';
import Button from '@panneau/element-button';
import Dropdown from '@panneau/element-dropdown';
import Label from '@panneau/element-label';

const propTypes = {
    label: PropTypes.string,
    value: PropTypes.arrayOf(PropTypes.any),
    types: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string,
            name: PropTypes.string,
            fields: PanneauPropTypes.fields,
        }),
    ),
    newItemDefaultValue: PropTypes.func,
    noItemLabel: PanneauPropTypes.label,
    addItemLabel: PanneauPropTypes.label,
    itemLabel: PanneauPropTypes.label,
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

    addItemDisabled: PropTypes.bool,

    inline: PropTypes.bool,
};

const defaultProps = {
    label: null,
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
    itemLabel: null,
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
    
    addItemDisabled: false,

    inline: false,
};

const ItemsField = ({
    label,
    value,
    types,
    newItemDefaultValue,
    noItemLabel,
    addItemLabel,
    itemLabel,
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

    addItemDisabled,

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
    useEffect(() => {
        const onWindowClick = () => {
            setDropdownOpened(false);
        };
        if (dropdownOpened) {
            window.addEventListener('click', onWindowClick);
        }
        return () => {
            window.removeEventListener('click', onWindowClick);
        };
    }, [dropdownOpened]);

    const itemElements = items.map(({ id, it }, index) => {
        const { type: itemType = null } = it || {};

        let itemChildren;
        const currentType = (types || []).find(({ id: typeId }) => itemType === typeId) || null;

        const renderedItemLabel = renderItemLabel !== null ? renderItemLabel(index) : null;
        const finalItemLabel = <Label>{itemLabel}</Label>;

        const defaultItemLabel =
            currentType !== null ? (
                <span>
                    {finalItemLabel}
                    { itemLabel !== null ? ' ' : null}
                    {`#${index + 1}`} - {currentType.name}
                </span>
            ) : (
                <span>
                    {finalItemLabel}
                    { itemLabel !== null ? ' ' : null}
                    {`#${index + 1}`}
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
                        'd-inline-flex flex-row me-3': inline,
                        show: !inline && !collapsed[index],
                    },
                ])}
                key={`item-${id}`}
            >
                {!inline ? (
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
                        { !withoutCollapse ?
                            <Button
                                className="position-absolute top-0 start-0 w-100 h-100"
                                onClick={() => toggleCollapse(index)}
                            />
                        : null }                        
                        <div className="card-content position-relative pe-none">
                            {!withoutCollapse ? (
                                <FontAwesomeIcon
                                    style={{ width: 20 }}
                                    className="me-1"
                                    icon={collapsed[index] ? faCaretRight : faCaretDown}
                                />
                            ) : null}
                            <span className="text-truncate">
                                {renderedItemLabel !== null ? renderedItemLabel : defaultItemLabel}
                            </span>
                        </div>
                        <div className="d-flex card-buttons position-relative ms-auto">
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
                        'p-3',
                        {
                            collapse: !inline && !withoutCollapse && collapsed[index],
                        },
                    ])}
                >
                    {renderItem !== null
                        ? renderItem(it, index, {
                              ...(isFunction(itemProps) ? itemProps(it, index) : itemProps),
                              children: itemChildren,
                              onChange: (newValue) => onItemChange(it, index, newValue),
                          })
                        : itemChildren}
                </div>
                {inline ? (
                    <div className={classNames(['card-header', 'd-flex', 'border-bottom-0'])}>
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
                    'pb-3',
                    'header',
                ])}
            >
                { label !== null ? <Label>{label}</Label> : null }
                {types !== null && types.length > 1 ? (
                    <div className="position-relative ms-auto">
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
                            <Label>{addItemLabel}</Label>
                        </Button>
                        <Dropdown
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
                {types !== null && types.length === 1 ? (
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
                {types === null || types.length === 0 ? (
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
