import React from 'react';
import { action } from '@storybook/addon-actions';// eslint-disable-line import/no-extraneous-dependencies

import storiesOf from '../../../.storybook/storiesOf';
import SelectField from '../SelectField';
import KeepValue from '../../../.storybook/KeepValue';

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

storiesOf('Fields/Select', module)
    .add('simple', () => (
        <div>
            <KeepValue>
                <SelectField
                    label="Label"
                    options={options}
                    value={3}
                    onChange={action('change')}
                />
            </KeepValue>
            <KeepValue>
                <SelectField
                    label="Not clearable"
                    options={options}
                    clearable={false}
                    addEmptyOption
                    value={2}
                    onChange={action('change')}
                />
            </KeepValue>
            <KeepValue>
                <SelectField
                    label="Cannot be empty"
                    options={options}
                    canBeEmpty={false}
                    onChange={action('change')}
                />
            </KeepValue>
        </div>
    ));
