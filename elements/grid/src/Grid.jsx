/* eslint-disable jsx-a11y/control-has-associated-label */

/* eslint-disable react/jsx-indent */

/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import { useItemSelection } from '@panneau/core/hooks';
import Icon from '@panneau/element-icon';

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
    multipleSelection: PropTypes.bool,
    onSelectionChange: PropTypes.func,
    selectedItems: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string })),
    className: PropTypes.string,
};

const defaultProps = {
    items: [],
    component: null,
    componentProps: null,
    size: null,
    gap: null,
    selectable: false,
    multipleSelection: false,
    onSelectionChange: null,
    selectedItems: null,
    className: null,
};

const Grid = ({
    items,
    component,
    componentProps,
    size,
    gap,
    selectable,
    multipleSelection,
    onSelectionChange,
    selectedItems: initialSelectedItems,
    className,
}) => {
    const {
        onSelectItem,
        onDeselectItem,
        onSelectPage,
        onDeselectPage,
        onClearAll,
        pageSelected,
        count: countSelected,
        selectedItems,
    } = useItemSelection({
        items,
        selectedItems: initialSelectedItems,
        onSelectionChange,
        multipleSelection,
    });

    const Component = component || null;

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
            {selectable ? (
                <div className="w-100 px-2 py-1 d-flex justify-content-between">
                    {countSelected > 0 ? (
                        <div>
                            <span className="d-inline-block mb-1">
                                <FormattedMessage
                                    defaultMessage="{count, plural, =0 {no items} one {# item} other {# items}} selected"
                                    description="Checkbox label"
                                    values={{ count: countSelected }}
                                />
                            </span>
                            <button
                                type="button"
                                className="btn badge rounded-pill text-bg-primary ms-2"
                                onClick={onClearAll}
                            >
                                <Icon name="x" bold />
                            </button>
                        </div>
                    ) : (
                        <span className="d-inline-block text-muted mb-1">
                            <FormattedMessage
                                defaultMessage="No items selected"
                                description="Checkbox label"
                            />
                        </span>
                    )}
                    {pageSelected ? (
                        <button
                            type="button"
                            className="btn badge rounded-pill outline text-bg-primary ms-2"
                            onClick={onDeselectPage}
                        >
                            <FormattedMessage
                                defaultMessage="Deselect all"
                                description="Checkbox label"
                            />
                            <Icon className="ms-1" name="x" bold />
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="btn badge rounded-pill text-bg-secondary ms-2"
                            onClick={onSelectPage}
                        >
                            <FormattedMessage
                                defaultMessage="Select all"
                                description="Checkbox label"
                            />
                            <Icon className="ms-1" name="check" bold />
                        </button>
                    )}
                </div>
            ) : null}
            <div className={styles.inner}>
                {Component !== null
                    ? (items || []).map((item) => {
                          const { id: itemId = null } = item || {};
                          const selected =
                              ((selectedItems || []).find(({ id = null } = {}) => id === itemId) ||
                                  null) !== null;
                          return (
                              <Component
                                  value={item}
                                  {...componentProps}
                                  {...(selectable
                                      ? {
                                            onClick: selected ? onDeselectItem : onSelectItem,
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
