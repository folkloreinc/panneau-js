/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import { action } from '@storybook/addon-actions';
import { IntlProvider } from 'react-intl';

import storiesOf from '../../../../.storybook/storiesOf';
import KeepValue from '../../../../.storybook/KeepValue';
import AutosuggestField from '../AutosuggestField';

const suggestions = [
    {
        name: 'Item 1',
    },
    {
        name: 'Item 2',
    },
    {
        name: 'Item 3',
    },
];

storiesOf('Fields/Autosuggest', module)
    .add('simple', () => (
        <IntlProvider locale="en">
            <div>
                <KeepValue>
                    <AutosuggestField
                        label="Label"
                        helpText="This is an help text"
                        suggestions={suggestions}
                        onChange={action('change')}
                    />
                </KeepValue>
            </div>
        </IntlProvider>
    ));
