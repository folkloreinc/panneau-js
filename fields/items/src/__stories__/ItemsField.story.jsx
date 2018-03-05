import React from 'react';
import { action } from '@storybook/addon-actions';// eslint-disable-line import/no-extraneous-dependencies
import { withFieldsCollection } from '@panneau/core';

import storiesOf from '../../../../.storybook/storiesOf';
import KeepValue from '../../../../.storybook/KeepValue';
import fieldsCollection from './fields';
import ItemsField from '../ItemsField';

const ItemsFieldWithFields = withFieldsCollection({
    childContext: true,
})(ItemsField);

const types = [
    {
        type: 'list',
        label: 'List',
        fields: [
            {
                type: 'text',
                name: 'text',
                label: 'Text',
            },
            {
                type: 'items',
                name: 'items',
                label: 'Items',
                sortable: true,
            },
        ],
    },
];

storiesOf('Fields/Items', module)
    .add('simple', () => (
        <div>
            <KeepValue>
                <ItemsFieldWithFields
                    types={types}
                    sortable
                    fieldsCollection={fieldsCollection}
                    label="Label"
                    helpText="This is an help text"
                    onChange={action('change')}
                />
            </KeepValue>
        </div>
    ));
