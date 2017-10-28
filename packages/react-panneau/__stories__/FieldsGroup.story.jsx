import React from 'react';
import { action } from '@storybook/addon-actions';// eslint-disable-line import/no-extraneous-dependencies

import storiesOf from '../../../.storybook/storiesOf';
import KeepValue from '../../../.storybook/KeepValue';
import FieldsGroup from '../src/FieldsGroup';
import withFieldsCollection from '../src/withFieldsCollection';

const FieldsGroupWithCollection = withFieldsCollection(FieldsGroup);

const fields = [
    {
        type: 'text',
        name: 'text',
        label: 'Text field',
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

storiesOf('FieldsGroup', module)
    .add('simple', () => (
        <KeepValue>
            <FieldsGroupWithCollection
                fields={fields}
                onChange={action('change')}
            />
        </KeepValue>
    ));
