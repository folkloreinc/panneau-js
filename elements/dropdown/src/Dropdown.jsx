/* eslint-disable react/jsx-props-no-spreading */
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useDocumentEvent } from '@panneau/core/hooks';
import Button from '@panneau/element-button';
import Label from '@panneau/element-label';
import Link from '@panneau/element-link';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useRef } from 'react';

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
            style={{ right: align === 'end' ? 0 : 'auto', left: align === 'start' ? 0 : 'auto' }}
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
                      } else if (type === 'button') {
                          ItemComponent = Button;
                      }
                      // console.log(id, label);
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
                                  'text-start': true,
                                  'd-block': true,
                                  'w-100': true,
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
