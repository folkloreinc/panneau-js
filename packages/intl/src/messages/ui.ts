import { defineMessage } from '../message';

/**
 * The messages of `@panneau/ui`, with their English text, which is also the default one. French
 * is in `../fr/ui.ts`.
 */
export const uiMessages = {
    close: defineMessage({ id: 'panneau.ui.close', defaultMessage: 'Close' }),
    /** The button of a toast that undoes what was just done (decision 0063). */
    undo: defineMessage({ id: 'panneau.ui.undo', defaultMessage: 'Undo' }),
    loading: defineMessage({ id: 'panneau.ui.loading', defaultMessage: 'Loading…' }),
    notifications: defineMessage({
        id: 'panneau.ui.notifications',
        defaultMessage: 'Notifications',
    }),
    selectPlaceholder: defineMessage({
        id: 'panneau.ui.select.placeholder',
        defaultMessage: 'Select…',
    }),
    noResults: defineMessage({ id: 'panneau.ui.noResults', defaultMessage: 'No results' }),
    showOptions: defineMessage({ id: 'panneau.ui.showOptions', defaultMessage: 'Show options' }),
    clear: defineMessage({ id: 'panneau.ui.clear', defaultMessage: 'Clear' }),
    moreActions: defineMessage({ id: 'panneau.ui.moreActions', defaultMessage: 'More actions' }),
    widenAside: defineMessage({ id: 'panneau.ui.widenAside', defaultMessage: 'Widen the panel' }),
    narrowAside: defineMessage({
        id: 'panneau.ui.narrowAside',
        defaultMessage: 'Narrow the panel',
    }),
    time: defineMessage({ id: 'panneau.ui.time', defaultMessage: 'Time' }),
    rangeStart: defineMessage({ id: 'panneau.ui.rangeStart', defaultMessage: 'Start' }),
    rangeEnd: defineMessage({ id: 'panneau.ui.rangeEnd', defaultMessage: 'End' }),
    calendar: defineMessage({ id: 'panneau.ui.calendar', defaultMessage: 'Calendar' }),
    dateShortcuts: defineMessage({ id: 'panneau.ui.dateShortcuts', defaultMessage: 'Shortcuts' }),
    barChartOther: defineMessage({ id: 'panneau.ui.barChartOther', defaultMessage: 'Other' }),
    meterTarget: defineMessage({ id: 'panneau.ui.meterTarget', defaultMessage: 'Target' }),
    meterValue: defineMessage<{ value: string; target: string }>({
        id: 'panneau.ui.meterValue',
        defaultMessage: '{value} of {target}',
    }),
    tags: defineMessage<{ label: string }>({
        id: 'panneau.ui.tags',
        defaultMessage: 'Tags: {label}',
    }),
    commandPalette: defineMessage({
        id: 'panneau.ui.commandPalette',
        defaultMessage: 'Search',
    }),
    commandResults: defineMessage<{ count: number }>({
        id: 'panneau.ui.commandResults',
        defaultMessage: '{count, plural, =0 {No results} one {# result} other {# results}}',
    }),
    commandRemoveScope: defineMessage<{ scope: string }>({
        id: 'panneau.ui.commandRemoveScope',
        defaultMessage: 'Stop searching in {scope}',
    }),
    commandHintMove: defineMessage({ id: 'panneau.ui.commandHintMove', defaultMessage: 'Move' }),
    commandHintOpen: defineMessage({ id: 'panneau.ui.commandHintOpen', defaultMessage: 'Open' }),
    commandHintClose: defineMessage({ id: 'panneau.ui.commandHintClose', defaultMessage: 'Close' }),
    chartPoint: defineMessage<{ label: string; value: string }>({
        id: 'panneau.ui.chartPoint',
        defaultMessage: '{label}: {value}',
    }),
    chartDate: defineMessage({ id: 'panneau.ui.chartDate', defaultMessage: 'Date' }),
    statChangeUp: defineMessage({ id: 'panneau.ui.statChangeUp', defaultMessage: 'Up' }),
    statChangeDown: defineMessage({ id: 'panneau.ui.statChangeDown', defaultMessage: 'Down' }),
    avatarStatus: defineMessage<{ name: string; status: string }>({
        id: 'panneau.ui.avatarStatus',
        defaultMessage: '{name} ({status})',
    }),
    avatarMore: defineMessage<{ count: number }>({
        id: 'panneau.ui.avatarMore',
        defaultMessage: '+{count, number}',
    }),
    avatarOthers: defineMessage<{ count: number }>({
        id: 'panneau.ui.avatarOthers',
        defaultMessage: '{count, plural, one {# other} other {# others}}',
    }),
    breadcrumbs: defineMessage({ id: 'panneau.ui.breadcrumbs', defaultMessage: 'Breadcrumbs' }),
    moreBreadcrumbs: defineMessage({
        id: 'panneau.ui.moreBreadcrumbs',
        defaultMessage: 'More pages',
    }),
    reorderItem: defineMessage<{ index: number }>({
        id: 'panneau.ui.reorderItem',
        defaultMessage: 'Item {index, number}',
    }),
    reorderHandle: defineMessage<{ item: string }>({
        id: 'panneau.ui.reorderHandle',
        defaultMessage: 'Move {item}',
    }),
    reorderBefore: defineMessage<{ item: string }>({
        id: 'panneau.ui.reorderBefore',
        defaultMessage: 'Before {item}',
    }),
    reorderAfter: defineMessage<{ item: string }>({
        id: 'panneau.ui.reorderAfter',
        defaultMessage: 'After {item}',
    }),
    reorderMoved: defineMessage<{ item: string; position: number; count: number }>({
        id: 'panneau.ui.reorderMoved',
        defaultMessage: '{item} moved to position {position, number} of {count, number}',
    }),
    /** The menu that moves an item of a reorderable list without dragging it (decision 0111). */
    reorderMenu: defineMessage<{ item: string }>({
        id: 'panneau.ui.reorderMenu',
        defaultMessage: 'Reorder {item}',
    }),
    reorderToStart: defineMessage({
        id: 'panneau.ui.reorderToStart',
        defaultMessage: 'Move to the start',
    }),
    reorderMoveBefore: defineMessage<{ item: string }>({
        id: 'panneau.ui.reorderMoveBefore',
        defaultMessage: 'Move before {item}',
    }),
    reorderMoveAfter: defineMessage<{ item: string }>({
        id: 'panneau.ui.reorderMoveAfter',
        defaultMessage: 'Move after {item}',
    }),
    reorderToEnd: defineMessage({
        id: 'panneau.ui.reorderToEnd',
        defaultMessage: 'Move to the end',
    }),
    /** The help of keyboard shortcuts (decision 0112): its title, and what opens it. */
    shortcutsTitle: defineMessage({
        id: 'panneau.ui.shortcutsTitle',
        defaultMessage: 'Keyboard shortcuts',
    }),
    shortcutsHelp: defineMessage({
        id: 'panneau.ui.shortcutsHelp',
        defaultMessage: 'Show keyboard shortcuts',
    }),
    /** The group of shortcuts without one. */
    shortcutsGeneral: defineMessage({
        id: 'panneau.ui.shortcutsGeneral',
        defaultMessage: 'General',
    }),
    /** Between two combinations of keys of one shortcut. */
    shortcutsOr: defineMessage({ id: 'panneau.ui.shortcutsOr', defaultMessage: 'or' }),
    singleKeyShortcuts: defineMessage({
        id: 'panneau.ui.singleKeyShortcuts',
        defaultMessage: 'Single-key shortcuts',
    }),
    singleKeyShortcutsDescription: defineMessage({
        id: 'panneau.ui.singleKeyShortcutsDescription',
        defaultMessage:
            'Shortcuts of one key, such as ?, never work while you type in a field. Turn them off if they get in your way.',
    }),
    /** Names of keys in shortcuts, off Apple platforms. */
    keyEnter: defineMessage({ id: 'panneau.ui.keyEnter', defaultMessage: 'Enter' }),
    keySpace: defineMessage({ id: 'panneau.ui.keySpace', defaultMessage: 'Space' }),
};
