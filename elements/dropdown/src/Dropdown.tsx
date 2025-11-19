/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import React, { useCallback, useRef } from 'react';

import type { DropdownAlign, MenuItem } from '@panneau/core/types';
import { useDocumentEvent } from '@panneau/core/hooks';
import Button from '@panneau/element-button';
import LabelComponent from '@panneau/element-label';
import Link from '@panneau/element-link';

import styles from './styles.module.css';

interface DropdownProps {
    items?: MenuItem[];
    children?: React.ReactNode | null;
    visible?: boolean;
    align?: DropdownAlign;
    className?: string | null;
    itemClassName?: string | null;
    onClickItem?: ((e: React.MouseEvent) => void) | null;
    onClickOutside?: ((e: MouseEvent) => void) | null;
}

const DEFAULT_ITEMS: MenuItem[] = [];

function Dropdown({
    items = DEFAULT_ITEMS,
    children = null,
    visible = false,
    align = null,
    className = null,
    itemClassName = null,
    onClickItem = null,
    onClickOutside = null
}: DropdownProps) {
    const refContainer = useRef<HTMLDivElement>(null);
    const onDocumentClick = useCallback(
        (e: MouseEvent) => {
            if (
                refContainer.current !== null &&
                !refContainer.current.contains(e.target as Node) &&
                visible &&
                onClickOutside !== null
            ) {
                onClickOutside(e);
            }
        },
        [visible, onClickOutside],
    );

    useDocumentEvent('click', onDocumentClick, visible);

    return (
        <div
            className={classNames([
                styles.container,
                'dropdown-menu',
                'relative',
                {
                    [`dropdown-menu-${align}`]: align !== null,
                    show: visible,
                    [className!]: className !== null,
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
                      } = it as any;
                      let ItemComponent: any = 'div';
                      if (type === 'link') {
                          ItemComponent = Link;
                      } else if (type === 'header') {
                          ItemComponent = 'h6';
                      } else if (type === 'button') {
                          ItemComponent = Button;
                      }

                      const finalOnClickItem =
                          customOnClick !== null || (type === 'link' && onClickItem !== null)
                              ? (e: React.MouseEvent) => {
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
                                  [itemClassName!]: itemClassName !== null,
                                  [customClassName]: customClassName !== null,
                              })}
                              onClick={finalOnClickItem}
                              {...(itemProps || null)}
                          >
                              {label !== null ? <LabelComponent>{label}</LabelComponent> : itemChildren}
                          </ItemComponent>
                      ) : null;
                  })}
        </div>
    );
}

export default Dropdown;
