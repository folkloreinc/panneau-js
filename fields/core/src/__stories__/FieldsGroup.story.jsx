import React from 'react';
import { action } from '@storybook/addon-actions';// eslint-disable-line import/no-extraneous-dependencies
import { IntlProvider } from 'react-intl';

import storiesOf from '../../../../.storybook/storiesOf';
import KeepValue from '../../../../.storybook/KeepValue';
import * as FieldsComponents from '../../../fields/src/index';
import FieldsGroup from '../FieldsGroup';

const fields = [
    {
        type: 'text',
        name: 'text',
        label: 'Text field',
    },
    {
        type: 'textlocale',
        name: 'textlocale',
        label: 'Text locale field',
        locales: ['fr', 'en'],
    },
    {
        type: 'select',
        name: 'select',
        label: 'Select field',
    },
    {
        type: 'color',
        name: 'color',
        label: 'Color field',
    },
    {
        type: 'code',
        name: 'code',
        label: 'Code field',
    },
];

storiesOf('Fields/Core/FieldsGroup', module)
    .add('simple', () => (
        <IntlProvider locale="en">
            <KeepValue>
                <FieldsGroup
                    fields={FieldsComponents}
                    fields={fields}
                    onChange={action('change')}
                />
            </KeepValue>
        </IntlProvider>
    ));
