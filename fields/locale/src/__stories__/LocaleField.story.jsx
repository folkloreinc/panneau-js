import React from 'react';
import { action } from '@storybook/addon-actions'; // eslint-disable-line import/no-extraneous-dependencies

import storiesOf from '../../../../.storybook/storiesOf';
import KeepValue from '../../../../.storybook/KeepValue';
import LocaleField from '../LocaleField';
import TextField from '../../../text/src/TextField';

storiesOf('Fields/Locale', module).add('simple', () => (
    <div>
        <KeepValue>
            <LocaleField
                label="Label for the localized field"
                locales={['fr', 'en']}
                helpText="This is an help text"
                onChange={action('change')}
                FieldComponent={TextField}
            />
        </KeepValue>
        <hr />
        <KeepValue>
            <LocaleField
                label="With custom field render function"
                locales={['fr', 'en', 'it']}
                helpText="This is an help text"
                onChange={action('change')}
                renderField={(locale, props) => (
                    <TextField
                        {...props}
                        label={`Label for field in ${locale}`}
                        placeholder={`This is a placeholder in ${locale}...`}
                        helpText={`This is an help text in ${locale}`}
                    />
                )}
            />
        </KeepValue>
    </div>
));
