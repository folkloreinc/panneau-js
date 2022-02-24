import React, { useState } from 'react';
import fields from '../../../../.storybook/data/fields';
import FieldsProvider from '../../../../packages/fields';
import TwoPane from '../TwoPane';

export default {
    component: TwoPane,
    title: 'Forms/TwoPane',
    parameters: {
        intl: true,
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
    return (
        <TwoPane fields={fields} value={value} onChange={setValue}>
            <p>Page preview</p>
        </TwoPane>
    );
};

export const TwoPaneForm = () => <Container />;
