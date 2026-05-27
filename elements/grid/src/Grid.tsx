import classNames from 'classnames';
import type { ElementType, ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';

import { type Item } from '@panneau/core';
import { toggleSelectedItem } from '@panneau/core/utils';
import Empty from '@panneau/element-empty';
import Loading from '@panneau/element-loading';

import styles from './styles.module.css';

interface GridItem extends Item {
    actionsDisabled?: boolean;
    selectionDisabled?: boolean;
}

interface GridProps {
    items?: GridItem[];
    component?: ElementType | null;
    componentProps?: Record<string, unknown> | null;
    size?: string | null;
    gap?: string | null;
    loading?: boolean;
    loaded?: boolean;
    empty?: boolean | null;
    emptyLabel?: ReactNode | null;
    selectable?: boolean;
    selectedItems?: Item[] | null;
    multipleSelection?: boolean;
    onSelectionChange?: ((items: Item[] | null) => void) | null;
    className?: string | null;
}

const DEFAULT_ITEMS: GridItem[] = [];

function Grid({
    items = DEFAULT_ITEMS,
    component = null,
    componentProps = null,
    size = null,
    gap = null,
    loading = false,
    loaded = false,
    empty = null,
    emptyLabel = null,
    selectable = false,
    selectedItems = null,
    onSelectionChange = null,
    multipleSelection = false,
    className = null,
}: GridProps) {
    const Component = component || null;

    const onSelectItem = (newItem: GridItem | null = null) => {
        const newSelectedItems = toggleSelectedItem(selectedItems, newItem, {
            multiple: multipleSelection,
        });
        if (onSelectionChange !== null) {
            onSelectionChange(newSelectedItems);
        }
    };

    return (
        <div
            className={classNames([styles.container, styles[size], className])}
            style={gap !== null ? { gridGap: gap } : undefined}
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
                              ? ((selectedItems || []).find(({ id = null }) => id === itemId) ||
                                    null) !== null
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
                <Loading className="mw-25 my-4 m-auto" withDelay>
                    <FormattedMessage defaultMessage="Loading" description="Loading label" />
                </Loading>
            ) : null}
            {empty || (!loading && loaded && (items === null || items.length === 0)) ? (
                <Empty className="mw-25 my-4 m-auto" withDelay>
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
}

export default Grid;
