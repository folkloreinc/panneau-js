/* eslint-disable jsx-a11y/control-has-associated-label, react/jsx-props-no-spreading, react/jsx-indent */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

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
    onSelectItem: PropTypes.func,
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
    onSelectItem: null,
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
    onSelectItem,
    selectedItems,
    className,
}) => {
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
            <div className={styles.inner}>
                {Component !== null
                    ? (items || []).map((item, idx) => {
                          const { id: itemId = null } = item || {};
                          const selected =
                              ((selectedItems || []).find(({ id = null } = {}) => id === itemId) ||
                                  null) !== null;
                          return (
                              <Component
                                  key={`item-${itemId}-${idx + 1}`}
                                  value={item}
                                  {...componentProps}
                                  {...(onSelectItem !== null
                                      ? {
                                            onClick: onSelectItem,
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
