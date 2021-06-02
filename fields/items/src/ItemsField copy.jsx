/* eslint-disable react/no-array-index-key */
/* eslint-disable react/jsx-props-no-spreading */
import { v1 as uuid } from 'uuid';
import React, { useCallback, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { defineMessages } from 'react-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretRight, faTimes } from '@fortawesome/free-solid-svg-icons';
import { ReactSortable } from 'react-sortablejs';

import * as AppPropTypes from '../../../lib/PropTypes';
import Label from '../../partials/Label';
import Button from '../buttons/Button';
import FormGroup from './FormGroup';

import styles from '../../../../styles/panneau/fields/items.module.scss';

const messages = defineMessages({
    item: {
        id: 'forms.item',
        defaultMessage: 'Item',
    },
    noItem: {
        id: 'forms.no_item',
        defaultMessage: 'No item.',
    },
    addItem: {
        id: 'forms.add_item_button',
        defaultMessage: 'Add item',
    },
});

const propTypes = {
    label: AppPropTypes.text,
    value: PropTypes.arrayOf(PropTypes.any),
    renderBefore: PropTypes.func,
    renderItem: PropTypes.func,
    renderItemLabel: PropTypes.func,
    itemLabel: AppPropTypes.label,
    addItemLabel: AppPropTypes.label,
    noItemLabel: AppPropTypes.label,
    withoutCollapse: PropTypes.bool,
    withoutSort: PropTypes.bool,
    withFloatingAddButton: PropTypes.bool,
    newItemDefaultValue: PropTypes.func,
    className: PropTypes.string,
    onChange: PropTypes.func,
    inline: PropTypes.bool,
};

const defaultProps = {
    label: null,
    value: null,
    renderBefore: null,
    renderItem: null,
    renderItemLabel: null,
    itemLabel: messages.item,
    addItemLabel: messages.addItem,
    noItemLabel: messages.noItem,
    withoutCollapse: false,
    withoutSort: false,
    withFloatingAddButton: false,
    newItemDefaultValue: () => ({}),
    className: null,
    onChange: null,
    inline: false,
};

const ItemsField = ({
    label,
    value,
    renderBefore,
    renderItem,
    renderItemLabel,
    itemLabel,
    addItemLabel,
    noItemLabel,
    withoutCollapse,
    withoutSort,
    withFloatingAddButton,
    newItemDefaultValue,
    className,
    onChange,
    inline,
}) => {
    const idMap = useRef((value || []).map(() => uuid()));
    const [collapsed, setCollapsed] = useState((value || []).map(() => true));

    const onClickAdd = useCallback(() => {
        const newValue = [...(value || []), newItemDefaultValue(value)];
        idMap.current = [...idMap.current, uuid()];
        setCollapsed((previousCollapsed) => [...previousCollapsed, false]);

        if (onChange !== null) {
            onChange(newValue);
        }
    }, [value, onChange, setCollapsed, newItemDefaultValue]);

    const onItemChange = useCallback(
        (it, index, newItemValue) => {
            const newValue = value.map((prevItem, prevIndex) => prevIndex !== index ? prevItem : newItemValue);
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

    const itemElements = items.map(({ id, it }, index) => {
        const renderedItemLabel = renderItemLabel !== null ? renderItemLabel(index) : null;
        const defaultItemLabel = (
            <span>
                <Label>{itemLabel}</Label>
                {` #${index + 1}`}
            </span>
        );
        return (
            <div
                className={classNames([
                    styles.item,
                    'mb-3',
                    'card',
                    {
                        [styles.inline]: inline,
                        [styles.opened]: !inline && !collapsed[index],
                    },
                ])}
                key={`item-${id}`}
            >
                {!inline ? (
                    <div className={classNames([styles.cardHeader, 'card-header'])}>
                        {!withoutCollapse ? (
                            <Button
                                className={styles.collapseToggle}
                                onClick={() => toggleCollapse(index)}
                            />
                        ) : null}
                        <div className={styles.cardHeaderContent}>
                            {!withoutCollapse ? (
                                <FontAwesomeIcon
                                    className={styles.arrowIcon}
                                    icon={collapsed[index] ? faCaretRight : faCaretDown}
                                />
                            ) : null}
                            <span className="text-truncate">
                                {renderedItemLabel !== null
                                    ? renderedItemLabel
                                    : defaultItemLabel}
                            </span>
                            <div className={styles.cardHeaderButtons}>
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
                                      onChange: (newValue) => onItemChange(it, index, newValue),
                                  })
                                : null}
                        </div>
                    </div>
                </div>
                {inline ? (
                    <div className={classNames([styles.cardHeader, 'card-header', 'd-flex'])}>
                        <div className={classNames([styles.cardHeaderButtons, 'm-auto'])}>
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
        <FormGroup
            className={classNames([
                styles.container,
                {
                    [className]: className !== null,
                    [styles.withFloatingAddButton]: withFloatingAddButton,
                },
            ])}
        >
            <div className={classNames(['d-flex', 'align-items-center', 'pb-3', styles.header])}>
                {!withFloatingAddButton ? <Label>{label}</Label> : null }
                <Button
                    type="button"
                    theme="primary"
                    outline
                    onClick={onClickAdd}
                    className="ml-auto"
                >
                    {addItemLabel}
                </Button>
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
        </FormGroup>
    );
};

ItemsField.propTypes = propTypes;
ItemsField.defaultProps = defaultProps;

export default ItemsField;
