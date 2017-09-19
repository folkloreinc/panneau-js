import React from 'react';

import TextField from './TextField';
import LocaleField from './LocaleField';

const TextLocaleField = props => (
    <LocaleField
        {...props}
        FieldComponent={TextField}
    />
);

export default TextLocaleField;
