import { defineMessage } from 'react-intl';

/** UI messages of `@panneau/lists`, with their English text. French is in `./locales/fr.ts`. */
export const messages = {
    list: defineMessage({ id: 'panneau.lists.list', defaultMessage: 'Items' }),
    search: defineMessage({ id: 'panneau.lists.search', defaultMessage: 'Search' }),
    searchPlaceholder: defineMessage({
        id: 'panneau.lists.searchPlaceholder',
        defaultMessage: 'Search…',
    }),
    filters: defineMessage({ id: 'panneau.lists.filters', defaultMessage: 'Filters' }),
    activeFilters: defineMessage({
        id: 'panneau.lists.activeFilters',
        defaultMessage: 'Active filters',
    }),
    removeFilter: defineMessage<{ filter: string }>({
        id: 'panneau.lists.removeFilter',
        defaultMessage: 'Remove the filter {filter}',
    }),
    searchChip: defineMessage<{ q: string }>({
        id: 'panneau.lists.searchChip',
        defaultMessage: 'Search: {q}',
    }),
    clearFilters: defineMessage({ id: 'panneau.lists.clearFilters', defaultMessage: 'Clear all' }),
    any: defineMessage({ id: 'panneau.lists.any', defaultMessage: 'Any' }),
    from: defineMessage({ id: 'panneau.lists.from', defaultMessage: 'From' }),
    to: defineMessage({ id: 'panneau.lists.to', defaultMessage: 'To' }),
    dateRange: defineMessage<{ from: string; to: string }>({
        id: 'panneau.lists.dateRange',
        defaultMessage: '{from} – {to}',
    }),
    yes: defineMessage({ id: 'panneau.lists.yes', defaultMessage: 'Yes' }),
    no: defineMessage({ id: 'panneau.lists.no', defaultMessage: 'No' }),
    sortBy: defineMessage({ id: 'panneau.lists.sortBy', defaultMessage: 'Sort by' }),
    defaultSort: defineMessage({ id: 'panneau.lists.defaultSort', defaultMessage: 'Default' }),
    sortAscending: defineMessage<{ column: string }>({
        id: 'panneau.lists.sortAscending',
        defaultMessage: '{column}, ascending',
    }),
    sortDescending: defineMessage<{ column: string }>({
        id: 'panneau.lists.sortDescending',
        defaultMessage: '{column}, descending',
    }),
    layout: defineMessage({ id: 'panneau.lists.layout', defaultMessage: 'Layout' }),
    layoutTable: defineMessage({ id: 'panneau.lists.layoutTable', defaultMessage: 'Table' }),
    layoutCards: defineMessage({ id: 'panneau.lists.layoutCards', defaultMessage: 'Cards' }),
    selectItem: defineMessage<{ item: string }>({
        id: 'panneau.lists.selectItem',
        defaultMessage: 'Select {item}',
    }),
    selectPage: defineMessage({
        id: 'panneau.lists.selectPage',
        defaultMessage: 'Select every item of the page',
    }),
    selectedCount: defineMessage<{ count: number }>({
        id: 'panneau.lists.selectedCount',
        defaultMessage: '{count, plural, one {# item selected} other {# items selected}}',
    }),
    selectAllMatching: defineMessage<{ total: number }>({
        id: 'panneau.lists.selectAllMatching',
        defaultMessage: 'Select all {total, plural, one {# item} other {# items}}',
    }),
    allMatchingSelected: defineMessage<{ total: number }>({
        id: 'panneau.lists.allMatchingSelected',
        defaultMessage:
            '{total, plural, one {The # item is selected} other {All # items are selected}}, on every page.',
    }),
    clearSelection: defineMessage({
        id: 'panneau.lists.clearSelection',
        defaultMessage: 'Clear the selection',
    }),
    actions: defineMessage({ id: 'panneau.lists.actions', defaultMessage: 'Actions' }),
    actionOnItem: defineMessage<{ action: string; item: string }>({
        id: 'panneau.lists.actionOnItem',
        defaultMessage: '{action}: {item}',
    }),
    itemActions: defineMessage<{ item: string }>({
        id: 'panneau.lists.itemActions',
        defaultMessage: 'Actions for {item}',
    }),
    confirmTitle: defineMessage<{ action: string }>({
        id: 'panneau.lists.confirmTitle',
        defaultMessage: '{action}?',
    }),
    confirmMessage: defineMessage<{ count: number; action: string }>({
        id: 'panneau.lists.confirmMessage',
        defaultMessage: '“{action}” will apply to {count, plural, one {# item} other {# items}}.',
    }),
    confirmSkipped: defineMessage<{ count: number }>({
        id: 'panneau.lists.confirmSkipped',
        defaultMessage:
            '{count, plural, one {# selected item doesn’t allow it and will be skipped.} other {# selected items don’t allow it and will be skipped.}}',
    }),
    cancel: defineMessage({ id: 'panneau.lists.cancel', defaultMessage: 'Cancel' }),
    actionFailed: defineMessage<{ action: string }>({
        id: 'panneau.lists.actionFailed',
        defaultMessage: '“{action}” failed.',
    }),
    empty: defineMessage({ id: 'panneau.lists.empty', defaultMessage: 'No items yet.' }),
    noResults: defineMessage({
        id: 'panneau.lists.noResults',
        defaultMessage: 'No items match the search or the filters.',
    }),
    loadFailed: defineMessage({
        id: 'panneau.lists.loadFailed',
        defaultMessage: 'The items could not be loaded.',
    }),
    retry: defineMessage({ id: 'panneau.lists.retry', defaultMessage: 'Try again' }),
    pagination: defineMessage({ id: 'panneau.lists.pagination', defaultMessage: 'Pagination' }),
    range: defineMessage<{ start: number; end: number; total: number }>({
        id: 'panneau.lists.range',
        defaultMessage: '{start, number}–{end, number} of {total, number}',
    }),
    pageOf: defineMessage<{ page: number; lastPage: number }>({
        id: 'panneau.lists.pageOf',
        defaultMessage: 'Page {page, number} of {lastPage, number}',
    }),
    previousPage: defineMessage({
        id: 'panneau.lists.previousPage',
        defaultMessage: 'Previous page',
    }),
    nextPage: defineMessage({ id: 'panneau.lists.nextPage', defaultMessage: 'Next page' }),
    perPage: defineMessage({ id: 'panneau.lists.perPage', defaultMessage: 'Per page' }),
};
