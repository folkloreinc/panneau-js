import React from 'react';
/* eslint-disable import/no-extraneous-dependencies */
import { action } from '@storybook/addon-actions';
/* eslint-enable import/no-extraneous-dependencies */
import { IntlProvider } from 'react-intl';
import { ComponentsCollection } from '@panneau/core';
import { ComponentsProvider } from '@panneau/core/contexts';

import storiesOf from '../../../../.storybook/storiesOf';
import KeepValue from '../../../../.storybook/KeepValue';
import * as FieldsComponents from '../../../../fields/fields/src/index';
import * as PreviewsComponents from '../../../../previews/previews/src/index';
import * as FormsComponents from '../../../forms/src/index';
import PreviewForm from '../PreviewForm'; // eslint-disable-line import/no-named-as-default

const componentsCollection = new ComponentsCollection();
componentsCollection.addComponents(FieldsComponents, 'fields');
componentsCollection.addComponents(PreviewsComponents, 'previews');
componentsCollection.addComponents(FormsComponents, 'forms');

const fields = [
    {
        type: 'text',
        name: 'title',
        label: 'Title',
    },
    {
        type: 'text',
        name: 'description1',
        label: 'Description 1',
        props: {
            type: 'textarea',
        },
    },
    {
        type: 'text',
        name: 'description2',
        label: 'Description 2',
        props: {
            type: 'textarea',
        },
    },
];

const submitAction = action('onSubmit');

storiesOf('Forms/Preview', module, {
    colWidth: 12,
})
    .add('simple', () => (
        <div>
            <ComponentsProvider collection={componentsCollection}>
                <IntlProvider locale="en">
                    <KeepValue onChangeName="onChange" onChange={action('onChange')}>
                        <PreviewForm
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
                        <PreviewForm
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
                        <PreviewForm
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
        <div>
            <ComponentsProvider collection={componentsCollection}>
                <IntlProvider
                    locale="en"
                    messages={{
                        'forms.normal.__stories__.test1': 'Custom button 1',
                    }}
                >
                    <KeepValue onChangeName="onChange" onChange={action('onChange')}>
                        <PreviewForm
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
                </IntlProvider>
            </ComponentsProvider>
        </div>
    ));
