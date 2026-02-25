/* eslint-disable jsx-a11y/control-has-associated-label */
import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type ComponentType,
    type MouseEvent,
    type ReactNode,
} from 'react';
import { faCaretDown, faCaretRight, faGripLines, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import isFunction from 'lodash/isFunction';
import { FormattedMessage } from 'react-intl';
import { ReactSortable } from 'react-sortablejs';
import { v4 as uuid } from 'uuid';

import { useFieldComponent, useFieldsComponentsManager } from '@panneau/core/contexts';
import type { Field, Label } from '@panneau/core/types';
import { getPathValue } from '@panneau/core/utils';
import Button from '@panneau/element-button';
import Dropdown from '@panneau/element-dropdown';
import LabelComponent from '@panneau/element-label';

interface ItemType {
    id?: string;
    name?: string;
    component?: string;
    fields?: Field[];
    [key: string]: unknown;
}

interface ItemsFieldItem {
    id?: string;
    type?: string;
    [key: string]: unknown;
}

interface InternalItem {
    id: string;
    it: ItemsFieldItem | null;
    index: number;
    valueIndex?: number;
    empty?: boolean;
}

interface ItemsFieldProps {
    label?: string | null;
    value?: ItemsFieldItem[] | null;
    types?: ItemType[] | null;
    newItemValue?: (() => ItemsFieldItem) | ItemsFieldItem;
    newItemValueWithUuid?: boolean;
    noItemLabel?: Label | null;
    addItemLabel?: Label | null;
    itemLabel?: Label | null;
    itemLabelPath?: string | null;
    itemComponent?: ComponentType<any> | null;
    itemProps?:
        | Record<string, unknown>
        | ((item: ItemsFieldItem, index: number) => Record<string, unknown>)
        | null;
    itemFields?: Field[] | null;
    itemField?: (Field & { fields?: Field[] }) | null;
    className?: string | null;
    onChange?: ((value: ItemsFieldItem[]) => void) | null;
    renderBefore?: (() => ReactNode) | null;
    renderItem?:
        | ((item: ItemsFieldItem, index: number, props: Record<string, unknown>) => ReactNode)
        | null;
    renderItemLabel?: ((index: number) => ReactNode) | null;
    withoutCollapse?: boolean;
    withoutSort?: boolean;
    withoutRemove?: boolean;
    withoutCard?: boolean;
    withoutListGroup?: boolean;
    excludeEmptyRequiredItems?: boolean;
    addItemDisabled?: boolean;
    maxItems?: number | null;
    buttons?: ReactNode | null;
    inline?: boolean;
    disabled?: boolean;
}

const DEFAULT_FIELDS: Field[] = [];

function ItemsField({
    label = null,
    value = null,
    types = null,
    newItemValue = () => ({}),
    newItemValueWithUuid = false,
    noItemLabel: initialNoItemLabel = null,
    addItemLabel: initialAddItemLabel = null,
    itemLabel: initialItemLabel = null,
    itemLabelPath = null,
    itemComponent: ItemComponent = null,
    itemProps = null,
    itemFields = null,
    itemField = null,
    className = null,
    onChange = null,
    renderBefore = null,
    renderItem = null,
    renderItemLabel = null,
    withoutListGroup = false,
    withoutCollapse = false,
    withoutSort = false,
    withoutRemove = false,
    withoutCard = false,
    excludeEmptyRequiredItems = false,
    addItemDisabled = false,
    maxItems = null,
    buttons = null,
    inline = false,
    disabled = false,
}: ItemsFieldProps) {
    const hasTypes = types !== null;
    const [itemIds, setItemIds] = useState<string[]>((value || []).map(() => uuid()));

    const [collapsed, setCollapsed] = useState<boolean[]>((value || []).map(() => true));
    const { component = null, ...fieldProps } = itemField || {};
    const FieldsComponent = useFieldComponent('fields');
    const FieldComponent = useFieldComponent(component);
    const fieldsManager = useFieldsComponentsManager();
    const generalFieldProps = disabled === true ? { disabled } : null;

    const addItemLabel = initialAddItemLabel || (
        <FormattedMessage defaultMessage="Add an item" description="Button label in items field" />
    );

    const itemLabel = initialItemLabel || (
        <FormattedMessage defaultMessage="Item" description="Items field's item label" />
    );

    const noItemLabel = initialNoItemLabel || (
        <FormattedMessage
            defaultMessage="No item found."
            description="Label when there is no item in items field"
        />
    );

    const [emptyItems, setEmptyItems] = useState<InternalItem[]>([]);
    const items = useMemo(() => {
        const tempValue = (value || []).map((v) => v);
        const valueCount = (value || []).length;
        return itemIds.map(
            (id, index): InternalItem =>
                emptyItems.find(({ id: emptyId = '' }) => emptyId === id) || {
                    id,
                    it: tempValue.length > 0 ? tempValue.shift()! : null,
                    index,
                    valueIndex: valueCount - tempValue.length - 1,
                },
        );
    }, [emptyItems, value, itemIds]);

    const allItemsCount = (value || []).length + emptyItems.length;
    const idsCount = itemIds.length;
    useEffect(() => {
        if (allItemsCount > idsCount) {
            const diff = allItemsCount - idsCount;
            const extraItems = [...Array(diff).keys()].map(() => uuid());
            setItemIds([...itemIds, ...extraItems]);
        }
    }, [allItemsCount, idsCount, setItemIds, itemIds]);

    const itemsCount = items ? items.length : 0;
    const isAddItemDisabled =
        disabled || addItemDisabled || (maxItems !== null ? itemsCount >= maxItems : false);

    const isItemEmpty = useCallback(
        (item: ItemsFieldItem | null) => {
            const { fields: subItemFields = null } = itemField || {};
            const { type: itemType = null } = item || {};

            const currentType = (types || []).find(({ id: typeId }) => itemType === typeId) || null;
            const { fields: typeItemFields = null } = currentType || {};

            const finalFields = typeItemFields || itemFields || subItemFields;

            const requiredFields = (finalFields || []).filter((it) => {
                const { required = false } = (it || {}) as Field & { required?: boolean };
                return required;
            }, false);

            if (requiredFields.length === 0) return false;

            return requiredFields.reduce(
                (acc, field) => acc || ((item || {})[field.name || ''] || null) === null,
                false,
            );
        },
        [itemFields, itemField, types],
    );

    const onClickAdd = useCallback(
        (newItemContent: Partial<ItemsFieldItem> | null = null) => {
            const newId = uuid();
            const defaultValue = isFunction(newItemValue) ? newItemValue() : newItemValue || null;
            let newValue =
                newItemContent !== null ? { ...defaultValue, ...newItemContent } : defaultValue;
            if (newItemValueWithUuid) {
                newValue = newValue !== null ? { ...newValue, id: newId } : { id: newId };
            }

            setItemIds([...itemIds, newId]);
            setCollapsed([...collapsed, false]);

            if (excludeEmptyRequiredItems && isItemEmpty(newValue)) {
                setEmptyItems([
                    ...(emptyItems || []),
                    { it: newValue, id: newId, index: itemsCount, empty: true },
                ]);
                return;
            }

            const finalValue = [...(value || []), newValue];
            if (onChange !== null) {
                onChange(finalValue);
            }
        },
        [
            value,
            onChange,
            setCollapsed,
            newItemValue,
            newItemValueWithUuid,
            excludeEmptyRequiredItems,
            emptyItems,
            itemsCount,
            setEmptyItems,
            setItemIds,
            itemIds,
            collapsed,
            isItemEmpty,
        ],
    );

    const onItemChange = useCallback(
        (it: InternalItem, newValue: ItemsFieldItem) => {
            if (excludeEmptyRequiredItems && isItemEmpty(newValue)) {
                const emptyIndex = emptyItems.findIndex(({ id = '' }) => it.id === id);

                if (emptyIndex === -1) {
                    const { valueIndex = undefined, ...otherProps } = it || {};
                    setEmptyItems([...emptyItems, { ...otherProps, empty: true }]);

                    if (onChange !== null) {
                        onChange(
                            (value || []).filter((val, prevIndex) => it.valueIndex !== prevIndex),
                        );
                    }
                } else {
                    setEmptyItems([
                        ...(emptyItems || []).slice(0, emptyIndex),
                        { ...it, it: newValue },
                        ...(emptyItems || []).slice(emptyIndex + 1),
                    ]);
                }
                return;
            }

            setEmptyItems((emptyItems || []).filter(({ id = '' }) => it.id !== id));

            const emptyIndex = emptyItems.findIndex(({ id = '' }) => it.id === id);
            const idIndex = itemIds.indexOf(it.id);
            const finalValue =
                emptyIndex !== -1
                    ? [
                          ...(value || []).slice(0, idIndex),
                          newValue,
                          ...(value || []).slice(idIndex),
                      ]
                    : (value || []).map((prevItem, prevIndex) =>
                          prevIndex !== it.valueIndex ? prevItem : newValue,
                      );

            if (onChange !== null) {
                onChange(finalValue);
            }
        },
        [excludeEmptyRequiredItems, value, onChange, emptyItems, itemIds, isItemEmpty],
    );

    const onClickRemove = useCallback(
        (e: MouseEvent, it: InternalItem, index: number) => {
            e.preventDefault();
            e.stopPropagation();
            const { id: itemId = '', valueIndex = null } = it || {};

            if (valueIndex !== null && valueIndex !== undefined) {
                const newValue = (value || []).filter((val, prevIndex) => valueIndex !== prevIndex);
                if (onChange !== null) {
                    onChange(newValue);
                }
            } else {
                setEmptyItems([
                    ...(emptyItems || []).filter(({ id: emptyId = '' }) => itemId !== emptyId),
                ]);
            }

            setCollapsed([...collapsed.slice(0, index), ...collapsed.slice(index + 1)]);
            setItemIds(itemIds.filter((id) => id !== itemId));
        },
        [value, onChange, setCollapsed, emptyItems, collapsed, itemIds, setItemIds],
    );

    const toggleCollapse = useCallback(
        (index: number) => {
            const newCollapsed = [...collapsed];
            newCollapsed[index] = !newCollapsed[index];
            setCollapsed(newCollapsed);
        },
        [collapsed, setCollapsed],
    );

    const sortList = useCallback(
        (newItems: InternalItem[]) => {
            if (newItems !== null && newItems.length < 2) {
                return;
            }

            const orderChanged = newItems.map(({ id = '' }) => id).join('-') !== itemIds.join('-');
            if (!orderChanged) {
                return;
            }

            setItemIds(newItems.map(({ id }) => id));

            // Empty
            setEmptyItems(newItems.filter(({ empty = false }) => empty));

            // Value
            const finalItems = newItems.filter(({ empty = false }) => !empty).map(({ it }) => it!);

            if (onChange !== null) {
                onChange(finalItems);
            }

            // Collapse state
            setCollapsed(newItems.map(({ id }) => collapsed[itemIds.indexOf(id)]));
        },
        [setCollapsed, collapsed, onChange, itemIds, setItemIds],
    );

    // Dropdown
    const [dropdownOpened, setDropdownOpened] = useState(false);
    const onClickDropdown = useCallback(
        (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setDropdownOpened((opened) => !opened);
        },
        [setDropdownOpened],
    );

    const onDropdownClickOutside = useCallback(() => {
        setDropdownOpened(false);
    }, [setDropdownOpened]);

    const itemElements = items.map((item, index) => {
        const { id, it } = item || {};

        const { type: itemType = null } = it || {};

        let itemChildren;
        // Assumes the type on an item is the type you want for the dropdown
        const currentType = (types || []).find(({ id: typeId }) => itemType === typeId) || null;

        const renderedItemLabel = renderItemLabel !== null ? renderItemLabel(index) : null;
        const basicItemLabel = <LabelComponent>{itemLabel}</LabelComponent>;

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

        const labelPathValue = itemLabelPath !== null ? getPathValue(it, itemLabelPath) : null;
        const finalItemLabel = labelPathValue !== null ? labelPathValue : defaultItemLabel;
        const finalRenderedItemLabel =
            renderedItemLabel !== null ? renderedItemLabel : finalItemLabel;

        if (ItemComponent !== null) {
            itemChildren = (
                <ItemComponent
                    {...generalFieldProps}
                    value={it}
                    onChange={(newValue: ItemsFieldItem) => onItemChange(item, newValue)}
                    {...(isFunction(itemProps) ? itemProps(it!, index) : itemProps)}
                />
            );
        } else if (FieldComponent !== null) {
            itemChildren = (
                <FieldComponent
                    {...generalFieldProps}
                    value={it}
                    onChange={(newValue: ItemsFieldItem) => onItemChange(item, newValue)}
                    {...fieldProps}
                    {...(isFunction(itemProps) ? itemProps(it!, index) : itemProps)}
                />
            );
        } else if (itemFields !== null) {
            itemChildren = (
                <FieldsComponent
                    {...generalFieldProps}
                    value={it}
                    onChange={(newValue: ItemsFieldItem) => onItemChange(item, newValue)}
                    fields={itemFields}
                />
            );
        } else if (currentType !== null) {
            const {
                component: typeComponent = null,
                fields: typeFields = null,
                id: typeId,
                ...typeProps
            } = currentType;
            const FieldTypeComponent =
                typeComponent !== null
                    ? fieldsManager.getComponent(typeComponent) || FieldsComponent
                    : FieldsComponent;
            itemChildren = (
                <FieldTypeComponent
                    {...generalFieldProps}
                    {...typeProps}
                    value={it}
                    onChange={(newValue: ItemsFieldItem) => onItemChange(item, newValue)}
                    fields={typeFields || itemFields}
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
                        'd-inline-flex flex-row': inline,
                        'list-group-item': withoutCard && !withoutListGroup,
                        show: !inline && !collapsed[index],
                    },
                ])}
                key={`item-${id}`}
            >
                {withoutCard && !inline ? (
                    <div
                        className={classNames([
                            {
                                'd-flex': true,
                                'align-items-end': true,
                                'justify-content-end': true,
                                'w-100': true,
                                'pb-2': true,
                                'border-bottom-0': !withoutCard,
                            },
                        ])}
                    >
                        {!withoutSort && !disabled ? (
                            <Button
                                className="me-2 item-handle"
                                theme="secondary"
                                size="sm"
                                outline
                            >
                                <FontAwesomeIcon icon={faGripLines} />
                            </Button>
                        ) : null}
                        {!withoutRemove && !disabled ? (
                            <Button
                                theme="secondary"
                                size="sm"
                                onClick={(e) => onClickRemove(e, item, index)}
                                outline
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </Button>
                        ) : null}
                    </div>
                ) : null}
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
                            {!withoutSort && !disabled ? (
                                <Button className="p-0 me-2" theme="secondary" size="sm" outline>
                                    <div className="py-1 px-2">
                                        <FontAwesomeIcon icon={faGripLines} />
                                    </div>
                                </Button>
                            ) : null}
                            {!withoutRemove && !disabled ? (
                                <Button
                                    theme="secondary"
                                    size="sm"
                                    onClick={(e) => onClickRemove(e, item, index)}
                                    outline
                                >
                                    <FontAwesomeIcon icon={faTimes} />
                                </Button>
                            ) : null}
                        </div>
                    </div>
                ) : null}
                <div
                    className={classNames([
                        'position-relative',
                        {
                            'p-4': !withoutCard,
                            'flex-grow-1': inline || withoutCard,
                            collapse: isCollapsed,
                        },
                    ])}
                >
                    {!isCollapsed
                        ? renderItem !== null
                            ? renderItem(it!, index, {
                                  ...(isFunction(itemProps) ? itemProps(it!, index) : itemProps),
                                  children: itemChildren,
                                  onChange: (newValue: ItemsFieldItem) =>
                                      onItemChange(item, newValue),
                              })
                            : itemChildren
                        : null}
                </div>
                {inline && !withoutCard ? (
                    <div className={classNames(['card-header', 'd-flex', 'border-bottom-0'])}>
                        {!withoutSort && !disabled ? (
                            <Button
                                className="m-auto me-2 item-handle"
                                theme="secondary"
                                size="sm"
                                outline
                            >
                                <FontAwesomeIcon icon={faGripLines} />
                            </Button>
                        ) : null}
                        {!withoutRemove && !disabled ? (
                            <Button
                                className="m-auto"
                                theme="secondary"
                                size="sm"
                                onClick={(e) => onClickRemove(e, item, index)}
                                outline
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </Button>
                        ) : null}
                    </div>
                ) : null}
            </div>
        );
    });

    return (
        <div className={className || undefined}>
            <div
                className={classNames([
                    'd-flex',
                    'align-items-center',
                    'justify-content-between',
                    'pb-3',
                    'header',
                ])}
            >
                {label !== null ? <LabelComponent>{label}</LabelComponent> : null}
                <div className="d-flex align-items-center">
                    {buttons !== null ? buttons : null}
                    {hasTypes && types!.length > 1 ? (
                        <div className="position-relative">
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
                                <LabelComponent>{addItemLabel}</LabelComponent>
                            </Button>
                            <Dropdown
                                onClickOutside={onDropdownClickOutside}
                                items={types!.map(({ id = null, name: typeName = null }) => ({
                                    id,
                                    label: typeName || 'label',
                                    type: 'button',
                                    disabled: isAddItemDisabled,
                                    onClick: () => {
                                        onClickAdd({ type: id || undefined });
                                        setDropdownOpened(false);
                                    },
                                }))}
                                visible={dropdownOpened}
                                align="end"
                            />
                        </div>
                    ) : null}
                    {hasTypes && types!.length === 1 ? (
                        <Button
                            theme="primary"
                            outline
                            disabled={isAddItemDisabled}
                            onClick={() => {
                                onClickAdd({
                                    type: types![0].id || undefined,
                                });
                            }}
                            className="ms-auto"
                        >
                            <LabelComponent>{addItemLabel}</LabelComponent>
                        </Button>
                    ) : null}
                    {!hasTypes || types!.length === 0 ? (
                        <Button
                            theme="primary"
                            outline
                            disabled={isAddItemDisabled}
                            onClick={() => onClickAdd()}
                            className="ms-auto"
                        >
                            <LabelComponent>{addItemLabel}</LabelComponent>
                        </Button>
                    ) : null}
                </div>
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
                        {!withoutSort && !disabled ? (
                            <ReactSortable
                                list={items}
                                setList={sortList}
                                handle={!withoutCard ? '.card-header' : '.item-handle'}
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
                    <div className="card text-muted text-center">
                        <div className="card-body">
                            <LabelComponent>{noItemLabel}</LabelComponent>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ItemsField;
