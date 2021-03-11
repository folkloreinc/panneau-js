/* eslint-disable react/no-array-index-key */
/* eslint-disable react/jsx-props-no-spreading */
import React, { useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { PropTypes as MicromagPropTypes } from '../../lib';
import { useDocumentEvent } from '../../hooks';
import Link from '../partials/Link';
import Label from '../partials/Label';
import Button from '../buttons/Button';

const propTypes = {
    items: MicromagPropTypes.menuItems,
    children: PropTypes.node,
    visible: PropTypes.bool,
    align: MicromagPropTypes.dropdownAlign,
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
            if (
                refContainer.current &&
                !refContainer.current.contains(e.currentTarget) &&
                onClickOutside !== null
            ) {
                onClickOutside(e);
            }
        },
        [refContainer.current, onClickOutside],
    );
    useDocumentEvent('click', onDocumentClick, visible);
    return (
        <div
            className={classNames([
                'dropdown-menu',
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
                      } else if (type === 'button') {
                          ItemComponent = Button;
                          itemProps.type = 'button';
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
                              key={`item-${index}`}
                              className={classNames([
                                  'd-block',
                                  'w-100',
                                  {
                                      'dropdown-item': type === 'link',
                                      'dropdown-divider': type === 'divider',
                                      'dropdown-header': type === 'header',
                                      active,
                                      [itemClassName]: itemClassName !== null,
                                      [customClassName]: customClassName !== null,
                                  },
                              ])}
                              onClick={finalOnClickItem}
                              {...itemProps}
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
