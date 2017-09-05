import React from 'react';
import { action } from '@storybook/addon-actions';// eslint-disable-line import/no-extraneous-dependencies

import storiesOf from '../../../.storybook/storiesOf';
import SelectField from '../SelectField';

const options = [
    {
        value: 1,
        label: 'Option 1',
    },
    {
        value: 2,
        label: 'Option 2',
    },
    {
        value: 3,
        label: 'Option 3',
    },
];

storiesOf('SelectField', module)
    .add('simple', () => (
        <SelectField
            label="Label"
            options={options}
            onChange={action('change')}
        />
    ))
    .add('not clearable', () => (
        <SelectField
            label="Label"
            options={options}
            clearable={false}
            value={2}
            onChange={action('change')}
        />
    ))
    .add('cannot be empty', () => (
        <SelectField
            label="Label"
            options={options}
            canBeEmpty={false}
            onChange={action('change')}
        />
    ));
