import React from 'react';
import { action } from '@storybook/addon-actions';// eslint-disable-line import/no-extraneous-dependencies
import { withFieldsCollection } from '@panneau/core';
import { IntlProvider } from 'react-intl';

import storiesOf from '../../../../.storybook/storiesOf';
import KeepValue from '../../../../.storybook/KeepValue';
import fieldsCollection from './fields';
import ItemsField from '../ItemsField';

const ItemsFieldWithFields = withFieldsCollection({
    childContext: true,
})(ItemsField);

const fields = [
    {
        type: 'editor',
        name: 'text',
        label: 'Text',
    },
    {
        type: 'items',
        name: 'items',
        label: 'Items',
        sortable: true,
    },
];

const types = [
    {
        type: 'list',
        label: 'List',
        fields,
    },
    {
        type: 'editor',
        label: 'Text',
        fields,
    },
];

storiesOf('Fields/Items', module)
    .add('with type', () => (
        <IntlProvider locale="en">
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
                <KeepValue>
                    <ItemsFieldWithFields
                        types={types}
                        sortable
                        fieldsCollection={fieldsCollection}
                        addButtonTypeLabel="a custom item"
                        label="Label"
                        helpText="This is an help text"
                        onChange={action('change')}
                    />
                </KeepValue>
            </div>
        </IntlProvider>
    ))
    .add('without type', () => (
        <div>
            <IntlProvider locale="en">
                <KeepValue>
                    <ItemsFieldWithFields
                        fields={fields}
                        sortable
                        fieldsCollection={fieldsCollection}
                        label="Label"
                        helpText="This is an help text"
                        onChange={action('change')}
                    />
                </KeepValue>
            </IntlProvider>
        </div>
    ))
    .add('without header', () => (
        <div>
            <IntlProvider locale="en">
                <KeepValue>
                    <ItemsFieldWithFields
                        fields={fields}
                        sortable
                        withoutHeader
                        fieldsCollection={fieldsCollection}
                        label="Label"
                        helpText="This is an help text"
                        onChange={action('change')}
                    />
                </KeepValue>
            </IntlProvider>
        </div>
    ));
