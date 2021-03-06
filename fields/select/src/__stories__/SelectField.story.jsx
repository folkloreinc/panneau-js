import React from 'react';
import { action } from '@storybook/addon-actions';// eslint-disable-line import/no-extraneous-dependencies
import { IntlProvider } from 'react-intl';

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
        <IntlProvider locale="en">
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
                <KeepValue>
                    <SelectField
                        label="With an error"
                        options={options}
                        errors="This value is invalid"
                        value={1}
                        onChange={action('change')}
                    />
                </KeepValue>
            </div>
        </IntlProvider>
    ))
    .add('multiple', () => (
        <IntlProvider locale="en">
            <div>
                <KeepValue>
                    <SelectField
                        label="Multiple"
                        options={options}
                        value={[2]}
                        multiple
                        onChange={action('change')}
                    />
                </KeepValue>
                <KeepValue>
                    <SelectField
                        label="Multiple and creatable"
                        options={options}
                        value={[1, 3]}
                        multiple
                        creatable
                        onChange={action('change')}
                    />
                </KeepValue>
                <KeepValue>
                    <SelectField
                        label="Async and creatable"
                        multiple
                        creatable
                        async
                        defaultOptions
                        fetchOptions={() => (
                            fetch('/api/pages')
                                .then(response => response.json())
                                .then(items => items.map(it => ({
                                    value: `${it.id}`,
                                    label: it.data.title.en,
                                })))
                        )}
                        onChange={action('change')}
                    />
                </KeepValue>
            </div>
        </IntlProvider>
    ));
