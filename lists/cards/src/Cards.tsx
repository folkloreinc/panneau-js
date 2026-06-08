import classNames from 'classnames';
import get from 'lodash-es/get';
import { type ReactNode, useMemo } from 'react';

import type { Item, Resource, TableColumn } from '@panneau/core';
import { useDisplaysComponents } from '@panneau/core/contexts';
import { getColumnsWithFields, getComponentFromName } from '@panneau/core/utils';
import Card from '@panneau/element-card';
import Empty from '@panneau/element-empty';
import Loading from '@panneau/element-loading';

interface CardsListProps {
    resource: Resource;
    items?: Item[] | null;
    loading?: boolean;
    loaded?: boolean;
    columns?: TableColumn[] | null;
    cardTitlePath?: string;
    displayPlaceholder?: ReactNode;
    reload?: (() => void) | null;
    updateItem?: ((item: Item) => void) | null;
    actionsProps?: Record<string, unknown> | null;
    withoutActionsColumn?: boolean;
}

const DEFAULT_ITEMS: Item[] = [];

function CardsList({
    resource,
    items = DEFAULT_ITEMS,
    loading = false,
    loaded = false,
    columns = null,
    cardTitlePath = 'title',
    reload = null,
    updateItem = null,
    actionsProps = null,
    displayPlaceholder = null,
    withoutActionsColumn = false,
}: CardsListProps) {
    const displayComponents = useDisplaysComponents();
    const columnWithFields = useMemo(
        () => getColumnsWithFields(resource, columns),
        [resource, columns],
    );

    const finalActionsProps = useMemo(
        () => ({
            reload,
            updateValue: updateItem,
            ...actionsProps,
        }),
        [actionsProps, reload, updateItem],
    );

    const idColumn =
        (columnWithFields.find(({ id, field }) => id === 'id' || field === 'id') || null) !== null;
    const { id: itemId } = idColumn || {};

    const actionColumn = (columnWithFields || []).find((it) => it.id === 'actions') || null;
    const { component: actionsComponent = null } = actionColumn || {};
    const ActionsDisplayComponent = getComponentFromName(
        actionsComponent || 'actions',
        displayComponents,
        'span',
    );

    const finalColumns = columnWithFields.filter(({ id }) => id !== 'id' && id !== 'actions');

    return (
        <div className="row g-2">
            {items !== null
                ? items.map((it) => {
                      const { id = null } = it || {};
                      const title = get(it, cardTitlePath);
                      return (
                          <div className="col-12 col-md-6 col-lg-4 col-xl-3" key={`card-${id}`}>
                              <Card
                                  header={
                                      title !== null ? (
                                          <span>
                                              {itemId} {title}
                                          </span>
                                      ) : (
                                          itemId
                                      )
                                  }
                                  footer={
                                      !withoutActionsColumn &&
                                      ActionsDisplayComponent !== null &&
                                      actionColumn !== null ? (
                                          <ActionsDisplayComponent
                                              placeholder={displayPlaceholder}
                                              {...finalActionsProps}
                                              {...actionColumn}
                                              item={it}
                                          />
                                      ) : null
                                  }
                              >
                                  {finalColumns.map((column, idx) => {
                                      const {
                                          id: colId,
                                          component,
                                          field = null,
                                          name = null,
                                          path = null,
                                          columnClassName = null,
                                          ...displayProps
                                      } = column || {};

                                      const FieldDisplayComponent = getComponentFromName(
                                          colId === 'actions'
                                              ? component || 'actions'
                                              : component || 'text',
                                          displayComponents,
                                          'span',
                                      );

                                      let displayValue = null;
                                      if (path !== null) {
                                          displayValue = get(it, path, null);
                                      } else if (name !== null) {
                                          displayValue = get(it, name, null);
                                      } else if (field !== null) {
                                          displayValue = get(it, field.name, null);
                                      }

                                      return (
                                          <div
                                              key={`col-${id}-${colId}-${idx + 1}`}
                                              className={classNames([
                                                  'card-text',
                                                  'text-break',
                                                  columnClassName,
                                              ])}
                                          >
                                              {FieldDisplayComponent !== null ? (
                                                  <FieldDisplayComponent
                                                      placeholder={displayPlaceholder}
                                                      {...(colId === 'actions'
                                                          ? finalActionsProps
                                                          : null)}
                                                      {...displayProps}
                                                      field={field}
                                                      value={displayValue}
                                                      item={it}
                                                  />
                                              ) : (
                                                  displayPlaceholder
                                              )}
                                          </div>
                                      );
                                  })}
                              </Card>
                          </div>
                      );
                  })
                : null}
            {loading && !loaded && (items === null || items.length === 0) ? (
                <Loading className="mw-25 my-4 m-auto" withDelay />
            ) : null}
            {!loading && loaded && (items === null || items.length === 0) ? (
                <Empty className="mw-25 my-4 m-auto" withDelay />
            ) : null}
        </div>
    );
}

export default CardsList;
