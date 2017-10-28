import React from 'react';
import LocaleField from '@react-panneau/field-locale';

import TextField from './TextField';

const TextLocaleField = props => (
    <LocaleField
        {...props}
        FieldComponent={TextField}
    />
);

export default TextLocaleField;
