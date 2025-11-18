/* eslint-disable react/jsx-props-no-spreading */
import { getCSRFHeaders } from '@folklore/fetch';
import React from 'react';

import panneauDefinition from '../../../../.storybook/data/panneau-definition';
import { PAGES_NAMESPACE, PREVIEWS_NAMESPACE } from '../../../core/src/contexts';
import PanneauContainer from '../components/Container';

import tenkDefinition from '../../../../.storybook/data/tenk-definition.json';

export default {
    component: <p>YO</p>,
    title: 'App/Interface',
    parameters: {
        intl: {
            locale: panneauDefinition.intl.locale,
        },
        router: false,
    },
};

const props = {
    baseUrl: 'http://localhost:58800/api', // Should be whatever, /api is for storybook
    uppy: {
        transport: 'xhr',
        xhr: {
            endpoint: 'https://ondinnok.test:8080/panneau/upload',
            headers: getCSRFHeaders(),
            timeout: 0,
        },
    },
};

const user = { id: 1, name: 'Folklore', email: 'info@atelierfolklore.ca' };

const englishIntl = {
    locale: 'en',
    locales: ['en', 'fr'],
    values: {
        name: 'Panneau in Englishe',
    },
    messages: {
        'resources.index': 'Read {a_plural}',
        'resources.create': 'Blabla',
    },
};

// console.log('panneauDefinition', panneauDefinition);

const CustomHomePage = () => <div className="text-primary bg-info">Home sweet home</div>;

const CustomEventPage = () => <div className="text-primary bg-info">Events page replacement</div>;

export const Guest = {
    render: () => (

    <PanneauContainer definition={panneauDefinition} memoryRouter {...props} />

    ),
};

export const GuestDarkEnglish = {
    render: () => (

    <PanneauContainer
        definition={{
            ...panneauDefinition,
            theme: { colorScheme: 'dark' },
            intl: englishIntl,
        }}
        memoryRouter
        {...props}
    />

    ),
};

export const LightMode = {
    render: () => (

    <PanneauContainer
        definition={{ ...panneauDefinition, theme: { colorScheme: 'light' } }}
        memoryRouter
        user={user}
        {...props}
    />

    ),
};

export const DarkMode = {
    render: () => (

    <PanneauContainer
        definition={{ ...panneauDefinition, theme: { colorScheme: 'dark' } }}
        memoryRouter
        user={user}
        {...props}
    />

    ),
};

const CustomPreviewPage = () => <div className="text-primary bg-info">PAGE PREVIEW</div>;

export const BlueModeWithComps = {
    render: () => (

    <PanneauContainer
        definition={{ ...panneauDefinition, theme: { colorScheme: 'blue' } }}
        components={{
            [PAGES_NAMESPACE]: {
                Home: CustomHomePage,
                // EventIndex: CustomEventPage,
                EventShow: CustomEventPage,
                EventCreate: CustomEventPage,
                EventEdit: CustomEventPage,
                EventDelete: CustomEventPage,
            },
            [PREVIEWS_NAMESPACE]: {
                pages: CustomPreviewPage,
            },
        }}
        memoryRouter
        user={user}
        {...props}
    />

    ),
};

export const Tenk = {
    render: () => (

    <PanneauContainer
        definition={{
            ...tenkDefinition,
            intl: englishIntl,
        }}
        memoryRouter
        user={user}
        {...props}
    />

    ),
};

export const English = {
    render: () => (

    <PanneauContainer
        definition={{
            ...panneauDefinition,
            intl: englishIntl,
        }}
        memoryRouter
        user={user}
        {...props}
    />

    ),
};