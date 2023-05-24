import React, { useState } from 'react';

// import fields from '../../../../.storybook/data/fields';
import pageResource from '../../../../.storybook/data/page-resource';
import FieldsProvider from '../../../../packages/fields';
import Resource from '../Resource';

export default {
    component: Resource,
    title: 'Forms/Resource',
    parameters: {
        intl: true,
        api: true,
    },
    decorators: [
        (Story) => (
            <FieldsProvider>
                <Story />
            </FieldsProvider>
        ),
    ],
};

const Container = () => {
    const [value, setValue] = useState({});
    return <Resource resource={pageResource} />;
};

export const ResourceForm = () => <Container />;
