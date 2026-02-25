import classNames from 'classnames';
import type { MouseEvent, ReactNode } from 'react';
import { useState } from 'react';

import type { DropdownAlign, MenuItem } from '@panneau/core';
import Dropdown from '@panneau/element-dropdown';
import Label from '@panneau/element-label';
import Link from '@panneau/element-link';

interface MenuProps {
    items?: MenuItem[];
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

const DEFAULT_ITEMS: MenuItem[] = [];

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
    const ListComponent: any = linkAsItem ? 'div' : tagName;
    return (
        <ListComponent className={className}>
            {children !== null
                ? children
                : items.map((it: any, index: number) => {
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
                      const onClickItem =
                          dropdown !== null
                              ? (e: MouseEvent) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setDropdownsVisible([
                                        ...dropdownsVisible.slice(0, index),
                                        !(dropdownsVisible[index] || false),
                                        ...dropdownsVisible.slice(index + 1),
                                    ]);
                                    if (customOnClick !== null) {
                                        customOnClick(e);
                                    }
                                }
                              : customOnClick;
                      const closeDropdown =
                          dropdown !== null
                              ? () => {
                                    setDropdownsVisible([
                                        ...dropdownsVisible.slice(0, index),
                                        false,
                                        ...dropdownsVisible.slice(index + 1),
                                    ]);
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
                              className={classNames({
                                  active,
                                  [itemClassName!]: itemClassName !== null,
                                  [customClassName]: customClassName !== null,
                                  [linkClassName!]: linkClassName !== null,
                                  [customLinkClassName]: customLinkClassName !== null,
                              })}
                          >
                              <Label {...itemProps}>{label}</Label>
                          </Link>
                      ) : (
                          <ItemComponent
                              key={`item-${id || index}`}
                              className={classNames({
                                  dropdown: dropdown !== null,
                                  active,
                                  [itemClassName!]: itemClassName !== null,
                                  [customClassName]: customClassName !== null,
                                  [hasSubMenuClassName!]:
                                      subItems !== null && hasSubMenuClassName !== null,
                                  [hasDropdownClassName!]:
                                      subItems !== null && hasDropdownClassName !== null,
                              })}
                          >
                              {href !== null || dropdown !== null ? (
                                  <Link
                                      {...itemProps}
                                      onClick={onClickItem}
                                      href={href || '#'}
                                      external={external}
                                      className={classNames({
                                          [linkClassName!]: linkClassName !== null,
                                          'dropdown-toggle': dropdown !== null,
                                          [customLinkClassName]: customLinkClassName !== null,
                                      })}
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
                                      itemClassName={classNames({
                                          [subMenuItemClassName!]: subMenuItemClassName !== null,
                                          [itemClassName!]:
                                              subMenuItemClassName === null &&
                                              itemClassName !== null,
                                      })}
                                      linkClassName={classNames({
                                          [subMenuLinkClassName!]: subMenuLinkClassName !== null,
                                          [linkClassName!]:
                                              subMenuLinkClassName === null &&
                                              linkClassName !== null,
                                      })}
                                  />
                              ) : null}
                              {dropdown !== null ? (
                                  <Dropdown
                                      items={dropdown}
                                      visible={dropdownVisible}
                                      className={dropdownClassName}
                                      itemClassName={classNames({
                                          [dropdownItemClassName!]: dropdownItemClassName !== null,
                                          [itemClassName!]:
                                              dropdownItemClassName === null &&
                                              itemClassName !== null,
                                      })}
                                      align={dropdownAlign}
                                      onClickItem={closeDropdown}
                                      onClickOutside={closeDropdown}
                                  />
                              ) : null}
                          </ItemComponent>
                      );
                  })}
        </ListComponent>
    );
}

export default Menu;
