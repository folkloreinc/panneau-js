# @panneau/lists

Lists of Panneau: items in a table or as cards, with columns and their displays, sorting, search, filters, pagination, selection and actions. They render the list state of [`@panneau/core`](../core) (query and selection) and fetch nothing: the caller gives the items of the query.

```bash
npm install @panneau/lists@^5.0.0-alpha.0 @panneau/core@^5.0.0-alpha.0 @panneau/ui@^5.0.0-alpha.0 react-aria-components react-intl
```

## Without a definition

A product with its own API writes its columns, keeps the query in a list state, and fetches its items:

```tsx
import { useList } from '@panneau/core';
import { ListView } from '@panneau/lists';
import { PanneauRoot } from '@panneau/ui';

function Members() {
    const { query, list } = useList({ defaults: { perPage: 20, sort: ['name'] } });
    const { data, isPending, error } = useMembers(query); // the product's own fetching

    return (
        <ListView
            list={list}
            aria-label="Members"
            columns={[
                { id: 'name', label: 'Name', sortable: true },
                { id: 'email', label: 'Email', display: 'email' },
                { id: 'role', label: 'Role', field: roleField, display: 'select' },
                { id: 'joined_on', label: 'Joined', display: 'date', sortable: true },
            ]}
            items={data?.items}
            total={data?.total}
            isLoading={isPending}
            error={error}
            search
            filters={[{ id: 'role', type: 'select', options: roles }]}
            actions={[
                {
                    id: 'remove',
                    label: 'Remove',
                    kind: 'server',
                    scope: ['item', 'selection'],
                    destructive: true,
                    confirm: true,
                },
            ]}
            onAction={({ action, item, selection }) => api.run(action.id, item?.id ?? selection)}
        />
    );
}
```

With every item at hand, `List` does the query in memory: `<List columns={columns} items={members} search />`.

## From a definition

`resolveList()` of `@panneau/core` gives the props of a resource's list:

```tsx
const { resource, list: resolved } = useResource('pages');
const { query, list } = useList({ list: resolved });
const { data, isFetching, error } = useResourceList('pages', query); // @panneau/data/query

<ListView
    {...resolved}
    list={list}
    items={data?.data}
    total={data?.meta.total}
    isLoading={isFetching}
    error={error}
    fields={resource.fields}
    itemTitle={resource.itemTitle}
    onAction={(event) => runAction(event)}
/>;
```

## What a list does

| Feature    | How                                                                                                                                                                          |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Columns    | `item[id]` shown with a display: the column's `display`, else text. Localized values in the UI's locale. `render` for a cell of its own                                      |
| Displays   | `text`, `textarea`, `slug`, `richtext`, `number`, `boolean`, `date`, `datetime`, `time`, `select`, `relation`, `url`, `email`, `color`, `media`                              |
| Layouts    | `table` and `cards` (`layouts`, the first is the default). On narrow lists, table rows stack and show the label of each value                                                |
| Sorting    | Sortable column headers (`aria-sort`), and a select for cards and phones                                                                                                     |
| Filters    | `text`, `select`, `toggle`, `date`, `date-range`, `relation`, with chips for the active filters and the search                                                               |
| Pagination | With `total`: the range, previous and next pages, and the page size (`perPageOptions`)                                                                                       |
| Selection  | Checkboxes, the page, then "select all N items", which selects every item matching the query, with exceptions                                                                |
| Actions    | `row` (buttons), `menu` (the row's menu), `toolbar` (selection and resource actions), with `confirm`, hidden by abilities ([0011](../../docs/decisions/0011-permissions.md)) |
| States     | A spinner, an error with a retry, an empty message, and "no results" with a button that clears the filters                                                                   |

Lists confirm an action when it has `confirm` (its title and message are ICU messages with `{count}`), or when some selected items don't allow it, then call `onAction` with the action, its scope, the item or the `Selection` of the protocol, the count and the skipped items. A promise shows the action as pending; when it rejects, a toast says that it failed. After a selection action, the selection is cleared.

## Plugins

Displays and layouts are registry entries. Plugins of `PanneauProvider` add or replace them, and so do the `displays` and `layoutComponents` props:

```tsx
definePlugin({ id: 'my-site', displays: { 'page-slug': PageSlugDisplay } });
```

A display gets `{ value, item, column, field }`. A layout gets the items, the columns, `renderValue(item, column)`, the selection and the actions (`ListLayoutProps`).

## Messages

Strings go through react-intl, with English defaults. Add `fr` from `@panneau/lists/locales` (and those of `@panneau/ui` and `@panneau/fields`) to the app's messages, or pass `listsPlugin`, which has all three.

| Export                   | Content                                                               |
| ------------------------ | --------------------------------------------------------------------- |
| `@panneau/lists`         | `ListView`, `List`, displays, layouts, filter controls, `listsPlugin` |
| `@panneau/lists/locales` | `en` and `fr` messages                                                |

The package layout, scripts and API reports are explained in [`docs/packages.md`](../../docs/packages.md).
