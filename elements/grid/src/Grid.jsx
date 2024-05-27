/* eslint-disable jsx-a11y/control-has-associated-label, react/jsx-props-no-spreading, react/jsx-indent */
import classNames from 'classnames';
import isArray from 'lodash/isArray';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

import { selectItem } from '@panneau/core/utils';
import Empty from '@panneau/element-empty';
import Loading from '@panneau/element-loading';

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
    loading: PropTypes.bool,
    loaded: PropTypes.bool,
    empty: PropTypes.bool,
    emptyLabel: PropTypes.node,
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
    loading: false,
    loaded: false,
    empty: null,
    emptyLabel: null,
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
    loading,
    loaded,
    empty,
    emptyLabel,
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
        if (selectedItems === null) {
            return null;
        }
        return isArray(selectedItems) ? selectedItems : [selectedItems];
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
                          const selected = itemSelectable
                              ? ((finalSelectedItems || []).find(
                                    ({ id = null } = {}) => id === itemId,
                                ) || null) !== null
                              : false;
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
            {loading && !loaded && (items === null || items.length === 0) ? (
                <Loading withDelay>
                    <FormattedMessage defaultMessage="Loading" description="Loading label" />
                </Loading>
            ) : null}
            {empty || (!loading && loaded && (items === null || items.length === 0)) ? (
                <Empty withDelay>
                    {emptyLabel || (
                        <FormattedMessage
                            defaultMessage="No results found"
                            description="Empty label"
                        />
                    )}
                </Empty>
            ) : null}
        </div>
    );
};

Grid.propTypes = propTypes;
Grid.defaultProps = defaultProps;

export default Grid;
