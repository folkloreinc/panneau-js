import definition from '../../../../.storybook/data/definition';
import AppStory from './components/AppStory';

/**
 * The whole Panneau app, with the example definition in .storybook/data/definition.ts
 * and the mock API in .storybook/api (changes are kept until storybook restarts).
 */
export default {
    title: 'App/Overview',
    component: AppStory,
    parameters: {
        intl: { locale: 'fr' },
        router: false,
        layout: 'fullscreen',
    },
};

export const Home = {
    render: () => <AppStory path="/" />,
};

export const Login = {
    name: 'Login (logged out)',
    render: () => <AppStory path="/" user={null} />,
};

/** auth: { forgotPassword: true, register: '/inscription' } (pages served by the backend) */
export const LoginWithLinks = {
    name: 'Login with links',
    render: () => (
        <AppStory
            path="/"
            user={null}
            definition={{ ...definition, auth: { forgotPassword: true, register: '/inscription' } }}
        />
    ),
};

export const Account = {
    render: () => <AppStory path="/account" />,
};

export const NotFound = {
    name: 'Not found',
    render: () => <AppStory path="/page-qui-nexiste-pas" />,
};
