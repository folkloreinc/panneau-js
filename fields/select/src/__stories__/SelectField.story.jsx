import React from 'react';
import { action } from '@storybook/addon-actions';// eslint-disable-line import/no-extraneous-dependencies

import storiesOf from '../../../../.storybook/storiesOf';
import KeepValue from '../../../../.storybook/KeepValue';
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
                    notClearable
                    addEmptyOption
                    value={2}
                    onChange={action('change')}
                />
            </KeepValue>
            <KeepValue>
                <SelectField
                    label="Cannot be empty"
                    options={options}
                    cannotBeEmpty
                    onChange={action('change')}
                />
            </KeepValue>
            <KeepValue>
                <SelectField
                    label="Disabled"
                    options={options}
                    disabled
                    value={2}
                    onChange={action('change')}
                />
            </KeepValue>
        </div>
    ))
    .add('multiple', () => (
        <div>
            <KeepValue>
                <SelectField
                    label="Multiple"
                    options={options}
                    multiple
                    onChange={action('change')}
                />
            </KeepValue>
            <KeepValue>
                <SelectField
                    label="Multiple and creatable"
                    options={options}
                    multiple
                    creatable
                    onChange={action('change')}
                />
            </KeepValue>
        </div>
    ));
