import React from 'react';
import { action } from '@storybook/addon-actions';// eslint-disable-line import/no-extraneous-dependencies
import { ComponentsCollection } from '@panneau/core';
import { ComponentsProvider } from '@panneau/core/contexts';
import { IntlProvider } from 'react-intl';

import storiesOf from '../../../../.storybook/storiesOf';
import KeepValue from '../../../../.storybook/KeepValue';
import * as FieldsComponents from './fields';
import ItemsField from '../ItemsField';

const componentsCollection = new ComponentsCollection();
componentsCollection.addComponents(FieldsComponents, 'fields');

const fields = [
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
];

const types = [
    {
        type: 'list',
        label: 'List',
        fields,
    },
];

storiesOf('Fields/Items', module)
    .add('with type', () => (
        <ComponentsProvider collection={componentsCollection}>
            <IntlProvider locale="en">
                <div>
                    <KeepValue>
                        <ItemsField
                            types={types}
                            sortable
                            label="Label"
                            helpText="This is an help text"
                            onChange={action('change')}
                        />
                    </KeepValue>
                    <KeepValue>
                        <ItemsField
                            types={types}
                            sortable
                            addButtonTypeLabel="a custom item"
                            label="Label"
                            helpText="This is an help text"
                            onChange={action('change')}
                        />
                    </KeepValue>
                </div>
            </IntlProvider>
        </ComponentsProvider>
    ))
    .add('without type', () => (
        <div>
            <ComponentsProvider collection={componentsCollection}>
                <IntlProvider locale="en">
                    <KeepValue>
                        <ItemsField
                            fields={fields}
                            sortable
                            label="Label"
                            helpText="This is an help text"
                            onChange={action('change')}
                        />
                    </KeepValue>
                </IntlProvider>
            </ComponentsProvider>
        </div>
    ))
    .add('without header', () => (
        <div>
            <ComponentsProvider collection={componentsCollection}>
                <IntlProvider locale="en">
                    <KeepValue>
                        <ItemsField
                            fields={fields}
                            sortable
                            withoutHeader
                            label="Label"
                            helpText="This is an help text"
                            onChange={action('change')}
                        />
                    </KeepValue>
                </IntlProvider>
            </ComponentsProvider>
        </div>
    ));
