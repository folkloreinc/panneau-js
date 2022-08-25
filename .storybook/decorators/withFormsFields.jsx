import React from 'react';
import FieldsProvider from '../../packages/fields';
import FormsProvider from '../../packages/forms';

const withFormsFields = (Story) => (
    <FieldsProvider>
        <FormsProvider>
            <Story />
        </FormsProvider>
    </FieldsProvider>
);

export default withFormsFields;
