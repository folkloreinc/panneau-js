import classNames from 'classnames';
import type { MouseEvent, ReactNode } from 'react';
import { useRef, useState } from 'react';

import type { DropdownAlign, MenuItem } from '@panneau/core';
import Dropdown, { type DropdownItem } from '@panneau/element-dropdown';
import Label from '@panneau/element-label';
import Link from '@panneau/element-link';

export interface MenuElementItem extends MenuItem {
    href?: string | null;
    className?: string | null;
    linkClassName?: string | null;
    items?: MenuElementItem[] | null;
    dropdown?: DropdownItem[] | null;
    onClick?: ((e: MouseEvent) => void) | null;
}

interface MenuProps {
    items?: MenuElementItem[];
    tagName?: string;
    itemTagName?: string;
    children?: ReactNode | null;
    linkAsItem?: boolean;
    className?: string | null;
    itemClassName?: string | null;
    linkClassName?: string | null;
    hasSubMenuClassName?: string | null;
    subMenuClassName?: string | null;
    subMenuItemClassName?: string | null;
    subMenuLinkClassName?: string | null;
    hasDropdownClassName?: string | null;
    dropdownClassName?: string | null;
    dropdownItemClassName?: string | null;
    dropdownLinkClassName?: string | null;
    dropdownAlign?: DropdownAlign;
}

const DEFAULT_ITEMS: MenuElementItem[] = [];

function Menu({
    items = DEFAULT_ITEMS,
    tagName = 'ul',
    itemTagName = 'li',
    children = null,
    linkAsItem = false,
    className = null,
    itemClassName = null,
    linkClassName = null,
    hasSubMenuClassName = null,
    subMenuClassName = null,
    subMenuItemClassName = null,
    subMenuLinkClassName = null,
    hasDropdownClassName = null,
    dropdownClassName = null,
    dropdownItemClassName = null,
    dropdownLinkClassName = null,
    dropdownAlign = null,
}: MenuProps) {
    const [dropdownsVisible, setDropdownsVisible] = useState(items.map(() => false));
    // The element of each item: a click in it (on the toggle of its dropdown) is not outside its
    // dropdown
    const itemsRef = useRef<(HTMLElement | null)[]>([]);
    const ListComponent: any = linkAsItem ? 'div' : tagName;
    return (
        <ListComponent className={className}>
            {children !== null
                ? children
                : items.map((it, index) => {
                      const {
                          id,
                          className: customClassName = null,
                          linkClassName: customLinkClassName = null,
                          href = null,
                          label,
                          external = false,
                          items: subItems = null,
                          dropdown = null,
                          active = false,
                          onClick: customOnClick = null,
                          ...itemProps
                      } = it;
                      // The click goes on to the document: the other open dropdowns, of this menu
                      // or of another one, see it as a click outside them and close
                      const onClickItem =
                          dropdown !== null
                              ? (e: MouseEvent) => {
                                    e.preventDefault();
                                    setDropdownsVisible((visibles) =>
                                        items.map((_item, itemIndex) =>
                                            itemIndex === index
                                                ? !(visibles[itemIndex] || false)
                                                : false,
                                        ),
                                    );
                                    if (customOnClick !== null) {
                                        customOnClick(e);
                                    }
                                }
                              : customOnClick;
                      const closeDropdown =
                          dropdown !== null
                              ? () => {
                                    setDropdownsVisible((visibles) =>
                                        items.map((_item, itemIndex) =>
                                            itemIndex === index
                                                ? false
                                                : visibles[itemIndex] || false,
                                        ),
                                    );
                                }
                              : null;
                      const onClickOutsideDropdown =
                          closeDropdown !== null
                              ? (e: globalThis.MouseEvent) => {
                                    const element = itemsRef.current[index] || null;
                                    if (element === null || !element.contains(e.target as Node)) {
                                        closeDropdown();
                                    }
                                }
                              : null;
                      const ItemComponent: any = itemTagName;
                      const dropdownVisible = dropdownsVisible[index] || false;
                      return linkAsItem ? (
                          <Link
                              {...itemProps}
                              key={`item-${id || index}`}
                              onClick={onClickItem}
                              href={href}
                              external={external}
                              className={classNames(
                                  itemClassName,
                                  customClassName,
                                  linkClassName,
                                  customLinkClassName,
                                  [
                                      {
                                          active,
                                      },
                                  ],
                              )}
                          >
                              <Label {...itemProps}>{label}</Label>
                          </Link>
                      ) : (
                          <ItemComponent
                              key={`item-${id || index}`}
                              ref={(element: HTMLElement | null) => {
                                  itemsRef.current[index] = element;
                              }}
                              className={classNames([
                                  {
                                      dropdown: dropdown !== null,
                                      active,
                                  },
                                  subItems !== null && hasSubMenuClassName !== null
                                      ? hasSubMenuClassName
                                      : null,
                                  subItems !== null && hasDropdownClassName !== null
                                      ? hasDropdownClassName
                                      : null,
                                  itemClassName,
                                  customClassName,
                              ])}
                          >
                              {href !== null || dropdown !== null ? (
                                  <Link
                                      {...itemProps}
                                      onClick={onClickItem}
                                      href={href || '#'}
                                      external={external}
                                      className={classNames([
                                          {
                                              'dropdown-toggle': dropdown !== null,
                                          },
                                          linkClassName,
                                          customLinkClassName,
                                      ])}
                                  >
                                      {label}
                                  </Link>
                              ) : (
                                  <Label {...itemProps}>{label}</Label>
                              )}
                              {subItems !== null ? (
                                  <Menu
                                      items={subItems}
                                      className={subMenuClassName}
                                      itemClassName={classNames([
                                          subMenuItemClassName,
                                          subMenuItemClassName === null && itemClassName !== null
                                              ? itemClassName
                                              : null,
                                      ])}
                                      linkClassName={classNames([
                                          subMenuLinkClassName,
                                          subMenuLinkClassName === null && linkClassName !== null
                                              ? linkClassName
                                              : null,
                                      ])}
                                  />
                              ) : null}
                              {dropdown !== null ? (
                                  <Dropdown
                                      items={dropdown}
                                      visible={dropdownVisible}
                                      className={dropdownClassName}
                                      itemClassName={classNames([
                                          dropdownItemClassName,
                                          dropdownItemClassName === null && itemClassName !== null
                                              ? itemClassName
                                              : null,
                                      ])}
                                      align={dropdownAlign}
                                      onClickItem={closeDropdown}
                                      onClickOutside={onClickOutsideDropdown}
                                  />
                              ) : null}
                          </ItemComponent>
                      );
                  })}
        </ListComponent>
    );
}

export default Menu;
