import { defineMessage } from '../message';

/**
 * The messages of `@panneau/app`, with their English text, which is also the default one. French
 * is in `../fr/app.ts`.
 */
export const appMessages = {
    loading: defineMessage({ id: 'panneau.app.loading', defaultMessage: 'Loading…' }),
    loadError: defineMessage({
        id: 'panneau.app.loadError',
        defaultMessage: 'The admin panel could not be loaded.',
    }),
    retry: defineMessage({ id: 'panneau.app.retry', defaultMessage: 'Try again' }),
    sessionEnded: defineMessage({
        id: 'panneau.app.sessionEnded',
        defaultMessage: 'Your session has ended.',
    }),
    logIn: defineMessage({ id: 'panneau.app.logIn', defaultMessage: 'Log in' }),
    skipToContent: defineMessage({
        id: 'panneau.app.skipToContent',
        defaultMessage: 'Skip to content',
    }),
    navigation: defineMessage({ id: 'panneau.app.navigation', defaultMessage: 'Main navigation' }),
    collapseSidebar: defineMessage({
        id: 'panneau.app.collapseSidebar',
        defaultMessage: 'Collapse the sidebar',
    }),
    expandSidebar: defineMessage({
        id: 'panneau.app.expandSidebar',
        defaultMessage: 'Expand the sidebar',
    }),
    openMenu: defineMessage({ id: 'panneau.app.openMenu', defaultMessage: 'Open the menu' }),
    closeMenu: defineMessage({ id: 'panneau.app.closeMenu', defaultMessage: 'Close the menu' }),
    colorScheme: defineMessage<{ scheme: string }>({
        id: 'panneau.app.colorScheme',
        defaultMessage:
            'Appearance: {scheme, select, light {light} dark {dark} other {same as the system}}',
    }),
    home: defineMessage({ id: 'panneau.app.home', defaultMessage: 'Home' }),
    welcome: defineMessage<{ name: string }>({
        id: 'panneau.app.welcome',
        defaultMessage: 'Welcome, {name}.',
    }),
    create: defineMessage<{ resource: string }>({
        id: 'panneau.app.create',
        defaultMessage: 'New {resource}',
    }),
    edit: defineMessage<{ resource: string }>({
        id: 'panneau.app.edit',
        defaultMessage: 'Edit the {resource}',
    }),
    created: defineMessage<{ resource: string }>({
        id: 'panneau.app.created',
        defaultMessage: 'The {resource} was created.',
    }),
    saved: defineMessage<{ resource: string }>({
        id: 'panneau.app.saved',
        defaultMessage: 'The {resource} was saved.',
    }),
    itemLoadError: defineMessage<{ resource: string }>({
        id: 'panneau.app.itemLoadError',
        defaultMessage: 'The {resource} could not be loaded.',
    }),
    itemPanel: defineMessage<{ resource: string }>({
        id: 'panneau.app.itemPanel',
        defaultMessage: 'Details of the {resource}',
    }),
    editItem: defineMessage({ id: 'panneau.app.editItem', defaultMessage: 'Edit' }),
    preview: defineMessage({ id: 'panneau.app.preview', defaultMessage: 'Preview' }),
    details: defineMessage({ id: 'panneau.app.details', defaultMessage: 'Details' }),
    previewOf: defineMessage<{ title: string }>({
        id: 'panneau.app.previewOf',
        defaultMessage: 'Preview of “{title}”',
    }),
    previewError: defineMessage({
        id: 'panneau.app.previewError',
        defaultMessage: 'The preview could not be loaded.',
    }),
    previewMissing: defineMessage<{ component: string }>({
        id: 'panneau.app.previewMissing',
        defaultMessage: 'No plugin provides the preview “{component}”.',
    }),
    openPreview: defineMessage({
        id: 'panneau.app.openPreview',
        defaultMessage: 'Open in a new tab',
    }),
    widenPanel: defineMessage({
        id: 'panneau.app.widenPanel',
        defaultMessage: 'Widen the details',
    }),
    narrowPanel: defineMessage({
        id: 'panneau.app.narrowPanel',
        defaultMessage: 'Narrow the details',
    }),
    closePanel: defineMessage({
        id: 'panneau.app.closePanel',
        defaultMessage: 'Close the details',
    }),
    goTo: defineMessage({ id: 'panneau.app.goTo', defaultMessage: 'Go to…' }),
    profile: defineMessage<{ name: string }>({
        id: 'panneau.app.profile',
        defaultMessage: 'Your profile ({name})',
    }),
    groupRecent: defineMessage({ id: 'panneau.app.groupRecent', defaultMessage: 'Recent' }),
    groupNavigation: defineMessage({
        id: 'panneau.app.groupNavigation',
        defaultMessage: 'Navigation',
    }),
    groupCreate: defineMessage({ id: 'panneau.app.groupCreate', defaultMessage: 'Create' }),
    groupCommands: defineMessage({ id: 'panneau.app.groupCommands', defaultMessage: 'Commands' }),
    groupActions: defineMessage({ id: 'panneau.app.groupActions', defaultMessage: 'Actions' }),
    groupSearchIn: defineMessage({ id: 'panneau.app.groupSearchIn', defaultMessage: 'Search in' }),
    searchPlaceholder: defineMessage({
        id: 'panneau.app.searchPlaceholder',
        defaultMessage: 'Search…',
    }),
    searchMinLength: defineMessage<{ count: number }>({
        id: 'panneau.app.searchMinLength',
        defaultMessage: 'Type at least {count, plural, one {# character} other {# characters}}.',
    }),
    seeAllResults: defineMessage<{ count: number }>({
        id: 'panneau.app.seeAllResults',
        defaultMessage: 'See all {count, plural, one {# result} other {# results}}',
    }),
    searching: defineMessage({ id: 'panneau.app.searching', defaultMessage: 'Searching…' }),
    searchRateLimited: defineMessage({
        id: 'panneau.app.searchRateLimited',
        defaultMessage: 'Too many searches. Wait a moment before the next one.',
    }),
    searchError: defineMessage({
        id: 'panneau.app.searchError',
        defaultMessage: 'The search failed. The other results are still here.',
    }),
    notFound: defineMessage({ id: 'panneau.app.notFound', defaultMessage: 'Page not found' }),
    notFoundText: defineMessage({
        id: 'panneau.app.notFoundText',
        defaultMessage: 'This page doesn’t exist, or you can’t see it.',
    }),
    backHome: defineMessage({ id: 'panneau.app.backHome', defaultMessage: 'Back to home' }),
    missingPage: defineMessage<{ component: string }>({
        id: 'panneau.app.missingPage',
        defaultMessage: 'No plugin provides the page “{component}”.',
    }),
};
