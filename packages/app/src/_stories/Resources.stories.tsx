import AppStory from './components/AppStory';

/**
 * One story per example resource (.storybook/data/resources), each one showing
 * a different set of features.
 */
export default {
    title: 'App/Resources',
    component: AppStory,
    parameters: {
        intl: { locale: 'fr' },
        router: false,
        layout: 'fullscreen',
    },
};

/** Typed resource, localized fields, table with filters and sortable columns */
export const Pages = {
    render: () => <AppStory path="/pages" />,
};

/** Header actions, relations (resource-item), badges and dates columns */
export const Events = {
    render: () => <AppStory path="/events" />,
};

/** Relations to persons (multiple) and to a page */
export const EventEdit = {
    name: 'Events - edit',
    render: () => <AppStory path="/events/1/edit" />,
};

/** Index displayed as cards */
export const Persons = {
    render: () => <AppStory path="/persons" />,
};

/** Batch actions (select rows to delete them) */
export const JobListings = {
    name: 'Job listings',
    render: () => <AppStory path="/jobListings" />,
};

/** Two-pane form with a live preview and grouped fields */
export const JobListingEdit = {
    name: 'Job listings - edit (two-pane)',
    render: () => <AppStory path="/jobListings/1/edit" />,
};

/** Medias library */
export const Medias = {
    render: () => <AppStory path="/medias" />,
};
