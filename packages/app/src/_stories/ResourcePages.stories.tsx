import AppStory from './components/AppStory';

/**
 * The built-in pages of a resource, shown with the "pages" resource
 * (.storybook/data/resources/pages.ts): a typed resource with blocks.
 */
export default {
    title: 'App/Resource pages',
    component: AppStory,
    parameters: {
        intl: { locale: 'fr' },
        router: false,
        layout: 'fullscreen',
    },
};

export const Index = {
    render: () => <AppStory path="/pages" />,
};

export const IndexWithFilters = {
    name: 'Index with filters',
    render: () => <AppStory path="/pages?type=page&published=false" />,
};

export const Create = {
    name: 'Create (choose a type)',
    render: () => <AppStory path="/pages/create" />,
};

export const CreateWithType = {
    name: 'Create with type',
    render: () => <AppStory path="/pages/create?type=contact" />,
};

export const Show = {
    render: () => <AppStory path="/pages/2" />,
};

export const Edit = {
    render: () => <AppStory path="/pages/2/edit" />,
};

export const EditHome = {
    name: 'Edit (home type, with banner and blocks)',
    render: () => <AppStory path="/pages/1/edit" />,
};

export const Duplicate = {
    render: () => <AppStory path="/pages/2/duplicate" />,
};

export const Delete = {
    render: () => <AppStory path="/pages/12/delete" />,
};
