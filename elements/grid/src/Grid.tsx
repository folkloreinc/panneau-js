/* eslint-disable jsx-a11y/control-has-associated-label */
import classNames from 'classnames';
import isArray from 'lodash-es/isArray';
import { useCallback, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

import { selectItem } from '@panneau/core/utils';
import Empty from '@panneau/element-empty';
import Loading from '@panneau/element-loading';

import styles from './styles.module.css';

interface GridItem {
    id?: string;
    actionsDisabled?: boolean;
    selectionDisabled?: boolean;
}

interface SelectedItem {
    id?: string | null;
}

interface GridProps {
    items?: GridItem[];
    component?: React.ComponentType<any> | null;
    componentProps?: Record<string, unknown> | null;
    size?: string | null;
    gap?: string | null;
    loading?: boolean;
    loaded?: boolean;
    empty?: boolean | null;
    emptyLabel?: React.ReactNode | null;
    selectable?: boolean;
    selectedItems?: SelectedItem[] | SelectedItem | null;
    multipleSelection?: boolean;
    onSelectionChange?: ((items: SelectedItem[] | SelectedItem | null) => void) | null;
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

    const onSelectItem = useCallback(
        (newItem: GridItem | null = null) => {
            selectItem(
                newItem as any,
                selectedItems as any,
                onSelectionChange as any,
                multipleSelection,
            );
        },
        [items, selectedItems, onSelectionChange, multipleSelection],
    );

    const finalSelectedItems = useMemo(() => {
        if (selectedItems === null) {
            return null;
        }
        return isArray(selectedItems) ? selectedItems : [selectedItems];
    }, [selectedItems]);

    // const onSelectPage = useCallback(
    //     (pageSelected = false) => {
    //         selectPage(pageSelected, items, selectedItems, onSelectionChange);
    //     },
    //     [items, selectedItems, onSelectionChange],
    // );

    return (
        <div
            className={classNames([
                styles.container,
                {
                    [styles[size!]]: size !== null,
                    [className!]: className !== null,
                },
            ])}
            style={gap !== null ? ({ gridGap: gap } as any) : undefined}
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
                              ? ((finalSelectedItems || []).find(
                                    ({ id = null }: any = {}) => id === itemId,
                                ) || null) !== null
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
                <Loading withDelay>
                    <FormattedMessage defaultMessage="Loading" description="Loading label" />
                </Loading>
            ) : null}
            {empty || (!loading && loaded && (items === null || items.length === 0)) ? (
                <Empty withDelay>
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
