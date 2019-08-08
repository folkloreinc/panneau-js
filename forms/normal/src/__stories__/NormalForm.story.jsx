import React from 'react';
/* eslint-disable import/no-extraneous-dependencies */
import { action } from '@storybook/addon-actions';
import * as FieldsComponents from '@panneau/fields';
/* eslint-enable import/no-extraneous-dependencies */
import { IntlProvider } from 'react-intl';
import { ComponentsCollection } from '@panneau/core';
import { ComponentsProvider } from '@panneau/core/contexts';

import storiesOf from '../../../../.storybook/storiesOf';
import KeepValue from '../../../../.storybook/KeepValue';
import NormalForm from '../NormalForm';

const componentsCollection = new ComponentsCollection();
componentsCollection.addComponents(FieldsComponents, 'fields');

const fields = [
    {
        type: 'text',
        name: 'title',
        label: 'Title',
    },
    {
        type: 'text',
        name: 'description',
        label: 'Description',
        props: {
            type: 'textarea',
        },
    },
];

const submitAction = action('onSubmit');

storiesOf('Forms/Normal', module)
    .add('simple', () => (
        <div>
            <ComponentsProvider collection={componentsCollection}>
                <IntlProvider locale="en">
                    <KeepValue onChangeName="onChange" onChange={action('onChange')}>
                        <NormalForm
                            fields={fields}
                            onSubmit={(e, value) => {
                                e.preventDefault();
                                return submitAction(value);
                            }}
                        />
                    </KeepValue>
                </IntlProvider>
            </ComponentsProvider>
        </div>
    ))
    .add('with errors', () => (
        <ComponentsProvider collection={componentsCollection}>
            <IntlProvider
                locale="en"
                messages={{
                    'forms.normal.__stories__.test1': 'Custom button 1',
                }}
            >
                <div>
                    <KeepValue onChangeName="onChange" onChange={action('onChange')}>
                        <NormalForm
                            fields={fields}
                            errors={{
                                title: 'A field error',
                            }}
                            onSubmit={(e, value) => {
                                e.preventDefault();
                                return submitAction(value);
                            }}
                        />
                    </KeepValue>
                    <hr />
                    <KeepValue onChangeName="onChange" onChange={action('onChange')}>
                        <NormalForm
                            fields={fields}
                            errors="A general error"
                            onSubmit={(e, value) => {
                                e.preventDefault();
                                return submitAction(value);
                            }}
                        />
                    </KeepValue>
                </div>
            </IntlProvider>
        </ComponentsProvider>
    ))
    .add('with custom button and notice', () => (
        <ComponentsProvider collection={componentsCollection}>
            <IntlProvider
                locale="en"
                messages={{
                    'forms.normal.__stories__.test1': 'Custom button 1',
                }}
            >
                <div>
                    <KeepValue onChangeName="onChange" onChange={action('onChange')}>
                        <NormalForm
                            fields={fields}
                            buttons={[
                                {
                                    label: 'Default test label 1',
                                    className: 'btn-success',
                                },
                            ]}
                            notice="This is a notice."
                            onSubmit={(e, value) => {
                                e.preventDefault();
                                return submitAction(value);
                            }}
                        />
                    </KeepValue>

                    <hr />

                    <KeepValue onChangeName="onChange" onChange={action('onChange')}>
                        <NormalForm
                            fields={fields}
                            buttons={[
                                {
                                    label: 'Default test label 1',
                                    className: 'btn-success',
                                },
                            ]}
                            notice={{
                                type: 'error',
                                label: 'This is an error notice.',
                            }}
                            onSubmit={(e, value) => {
                                e.preventDefault();
                                return submitAction(value);
                            }}
                        />
                    </KeepValue>

                    <KeepValue onChangeName="onChange" onChange={action('onChange')}>
                        <NormalForm
                            fields={fields}
                            buttons={[
                                {
                                    label: 'Default test label 1',
                                    className: 'btn-success',
                                },
                            ]}
                            notice={{
                                type: 'success',
                                label: 'This is a success notice.',
                            }}
                            onSubmit={(e, value) => {
                                e.preventDefault();
                                return submitAction(value);
                            }}
                        />
                    </KeepValue>
                </div>
            </IntlProvider>
        </ComponentsProvider>
    ));
