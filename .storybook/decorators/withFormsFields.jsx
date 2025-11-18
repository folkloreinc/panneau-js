import React from 'react';

import FieldsProvider from '../../packages/fields';
import FormsProvider from '../../packages/forms';

function withFormsFields(Story) {
    return (
        <FieldsProvider>
            <FormsProvider>
                <Story />
            </FormsProvider>
        </FieldsProvider>
    );
}

export default withFormsFields;
