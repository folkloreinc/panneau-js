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
    closePanel: defineMessage({
        id: 'panneau.app.closePanel',
        defaultMessage: 'Close the details',
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
