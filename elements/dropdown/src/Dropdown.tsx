import classNames from 'classnames';
import type { CSSProperties, MouseEvent, ReactNode } from 'react';
import { useCallback, useRef } from 'react';

import type { DropdownAlign, MenuItem } from '@panneau/core';
import { useDocumentEvent } from '@panneau/core/hooks';
import Button from '@panneau/element-button';
import LabelComponent from '@panneau/element-label';
import Link from '@panneau/element-link';

export interface DropdownItem extends MenuItem {
    // 'link' (default), 'button', 'header' or 'divider'
    type?: string;
    href?: string | null;
    target?: string;
    disabled?: boolean;
    className?: string | null;
    children?: ReactNode | null;
    onClick?: ((e: MouseEvent) => void) | null;
}

interface DropdownProps {
    items?: DropdownItem[];
    children?: ReactNode | null;
    visible?: boolean;
    dropup?: boolean;
    align?: DropdownAlign;
    style?: CSSProperties | null;
    className?: string | null;
    itemClassName?: string | null;
    onClickItem?: ((e: MouseEvent) => void) | null;
    onClickOutside?: ((e: globalThis.MouseEvent) => void) | null;
}

const DEFAULT_ITEMS: DropdownItem[] = [];

function Dropdown({
    items = DEFAULT_ITEMS,
    children = null,
    visible = false,
    dropup = false,
    align = null,
    style = null,
    className = null,
    itemClassName = null,
    onClickItem = null,
    onClickOutside = null,
}: DropdownProps) {
    const refContainer = useRef<HTMLElement | null>(null);
    // Callback ref so it can be applied to either the div or the ul menu element
    const setContainerRef = useCallback((element: HTMLElement | null) => {
        refContainer.current = element;
    }, []);
    const onDocumentClick = useCallback(
        (e: globalThis.MouseEvent) => {
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

    useDocumentEvent('click', onDocumentClick, visible && onClickOutside !== null);

    const MenuComponent = children !== null ? 'div' : 'ul';

    return (
        <MenuComponent
            className={classNames([
                'dropdown-menu',
                align !== null ? `dropdown-menu-${align}` : null,
                {
                    show: visible,
                },
                className,
            ])}
            style={
                style || {
                    right: align === 'end' ? 0 : 'auto',
                    left: align === 'start' ? 0 : 'auto',
                    top: dropup ? 'auto' : '100%',
                    bottom: dropup ? '100%' : 'auto',
                }
            }
            ref={setContainerRef}
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
                              ? (e: MouseEvent) => {
                                    if (customOnClick !== null) {
                                        customOnClick(e);
                                    }
                                    if (type === 'link' && onClickItem !== null) {
                                        onClickItem(e);
                                    }
                                }
                              : null;
                      return ItemComponent !== null ? (
                          <li key={`item-${id || index}`}>
                              <ItemComponent
                                  className={classNames([
                                      {
                                          'dropdown-item': type === 'link' || type === 'button',
                                          'dropdown-divider': type === 'divider',
                                          'dropdown-header': type === 'header',
                                          active,
                                      },
                                      itemClassName,
                                      customClassName,
                                  ])}
                                  onClick={finalOnClickItem}
                                  {...itemProps}
                              >
                                  {label !== null ? (
                                      <LabelComponent>{label}</LabelComponent>
                                  ) : (
                                      itemChildren
                                  )}
                              </ItemComponent>
                          </li>
                      ) : null;
                  })}
        </MenuComponent>
    );
}

export default Dropdown;
