/* eslint-disable react/jsx-props-no-spreading */
import React, { useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useDocumentEvent } from '@panneau/core/hooks';
import Link from '@panneau/element-link';
import Label from '@panneau/element-label';

const propTypes = {
    items: PanneauPropTypes.menuItems,
    children: PropTypes.node,
    visible: PropTypes.bool,
    align: PanneauPropTypes.dropdownAlign,
    className: PropTypes.string,
    itemClassName: PropTypes.string,
    onClickItem: PropTypes.func,
    onClickOutside: PropTypes.func,
};

const defaultProps = {
    items: [],
    children: null,
    visible: false,
    align: null,
    className: null,
    itemClassName: null,
    onClickItem: null,
    onClickOutside: null,
};

const Dropdown = ({
    items,
    children,
    visible,
    align,
    className,
    itemClassName,
    onClickItem,
    onClickOutside,
}) => {
    const refContainer = useRef(null);
    const onDocumentClick = useCallback(
        (e) => {
            if (!refContainer.current.contains(e.currentTarget) && onClickOutside !== null) {
                onClickOutside(e);
            }
        },
        [onClickOutside],
    );
    useDocumentEvent('click', onDocumentClick, visible);

    return (
        <div
            className={classNames([
                'dropdown-menu',
                'relative',
                {
                    [`dropdown-menu-${align}`]: align !== null,
                    show: visible,
                    [className]: className !== null,
                },
            ])}
            ref={refContainer}
        >
            {children !== null
                ? children
                : items.map((it, index) => {
                      const {
                          id = null,
                          type = 'link',
                          className: customClassName = null,
                          label = null,
                          children: itemChildren = null,
                          onClick: customOnClick = null,
                          active = false,
                          ...itemProps
                      } = it;
                      let ItemComponent = 'div';
                      if (type === 'link') {
                          ItemComponent = Link;
                      } else if (type === 'header') {
                          ItemComponent = 'h6';
                      }
                      const finalOnClickItem =
                          customOnClick !== null || (type === 'link' && onClickItem !== null)
                              ? (e) => {
                                    if (customOnClick !== null) {
                                        customOnClick(e);
                                    }
                                    if (type === 'link' && onClickItem !== null) {
                                        onClickItem(e);
                                    }
                                }
                              : null;
                      return ItemComponent !== null ? (
                          <ItemComponent
                              key={`item-${id || index}`}
                              className={classNames({
                                  'dropdown-item': type === 'link',
                                  'dropdown-divider': type === 'divider',
                                  'dropdown-header': type === 'header',
                                  active,
                                  [itemClassName]: itemClassName !== null,
                                  [customClassName]: customClassName !== null,
                              })}
                              onClick={finalOnClickItem}
                              {...(itemProps || null)}
                          >
                              {label !== null ? <Label>{label}</Label> : itemChildren}
                          </ItemComponent>
                      ) : null;
                  })}
        </div>
    );
};

Dropdown.propTypes = propTypes;
Dropdown.defaultProps = defaultProps;

export default Dropdown;
