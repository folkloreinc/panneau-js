/* eslint-disable jsx-a11y/control-has-associated-label, react/jsx-props-no-spreading, react/jsx-indent */
import classNames from 'classnames';
import isArray from 'lodash/isArray';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo } from 'react';

import { selectItem } from '@panneau/core/utils';

import styles from './styles.module.scss';

const propTypes = {
    items: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string,
            content: PropTypes.oneOf([PropTypes.string, PropTypes.node]),
        }),
    ),
    component: PropTypes.func,
    componentProps: PropTypes.shape({}),
    size: PropTypes.string,
    gap: PropTypes.string,
    selectable: PropTypes.bool,
    selectedItems: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string })),
    multipleSelection: PropTypes.bool,
    onSelectionChange: PropTypes.func,
    className: PropTypes.string,
};

const defaultProps = {
    items: [],
    component: null,
    componentProps: null,
    size: null,
    gap: null,
    selectable: false,
    selectedItems: null,
    multipleSelection: false,
    onSelectionChange: null,
    className: null,
};

const Grid = ({
    items,
    component,
    componentProps,
    size,
    gap,
    selectable,
    selectedItems,
    onSelectionChange,
    multipleSelection,
    className,
}) => {
    const Component = component || null;

    const onSelectItem = useCallback(
        (newItem = null) => {
            selectItem(newItem, selectedItems, onSelectionChange, multipleSelection);
        },
        [items, selectedItems, onSelectionChange, multipleSelection],
    );

    const finalSelectedItems = useMemo(() => {
        const partialSelectedItems =
            selectedItems !== null && !isArray(selectedItems) ? [selectedItems] : null;
        return selectedItems !== null && isArray(selectedItems)
            ? selectedItems.filter((it) => it !== null)
            : partialSelectedItems;
    }, [selectedItems]);

    // const onSelectPage = useCallback(
    //     (pageSelected = false) => {
    //         selectPage(pageSelected, items, selectedItems, onSelectionChange);
    //     },
    //     [items, selectedItems, onSelectionChange],
    // );

    return (
        <div
            className={classNames([
                styles.container,
                {
                    [styles[size]]: size !== null,
                    [className]: className !== null,
                },
            ])}
            style={gap !== null ? { 'grid-gap': gap } : null}
        >
            <div className={styles.inner}>
                {Component !== null
                    ? (items || []).map((item, idx) => {
                          const {
                              id: itemId = null,
                              actionsDisabled = false,
                              selectionDisabled = false,
                          } = item || {};
                          const itemSelectable = selectionDisabled ? false : selectable;
                          let selected = false;
                          if (multipleSelection) {
                              selected = itemSelectable
                                  ? ((finalSelectedItems || []).find(
                                        ({ id = null } = {}) => id === itemId,
                                    ) || null) !== null
                                  : false;
                          } else if (!isArray(finalSelectedItems)) {
                              const { id: selectedId } = finalSelectedItems || {};
                              selected = selectedId === itemId;
                          }
                          return (
                              <Component
                                  key={`item-${itemId}-${idx + 1}`}
                                  value={item}
                                  selectable={itemSelectable}
                                  selected={itemSelectable && selected}
                                  actionsDisabled={actionsDisabled}
                                  {...componentProps}
                                  {...(itemSelectable && onSelectionChange !== null
                                      ? {
                                            onClick: () => onSelectItem(item),
                                            selected,
                                        }
                                      : null)}
                              />
                          );
                      })
                    : null}
            </div>
        </div>
    );
};

Grid.propTypes = propTypes;
Grid.defaultProps = defaultProps;

export default Grid;
