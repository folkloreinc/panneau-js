import React, { useState } from 'react';

import TwoPane from '../TwoPane';

import FieldsProvider from '../../../../packages/fields';

import fields from '../../../../.storybook/data/fields';

export default {
    component: TwoPane,
    title: 'Forms/TwoPane',
    parameters: {
        intl: true,
    },
};

const Container = () => {
    const [value, setValue] = useState({});
    return (
        <FieldsProvider>
            <TwoPane fields={fields} value={value} onChange={setValue}>
                <p>Page preview</p>
            </TwoPane>
        </FieldsProvider>
    );
};

export const TwoPaneForm = () => <Container />;
