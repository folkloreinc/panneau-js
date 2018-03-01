import React from 'react';
/* eslint-disable import/no-extraneous-dependencies */
import { action } from '@storybook/addon-actions';
import { withFieldsCollection } from '@panneau/fields';
/* eslint-enable import/no-extraneous-dependencies */
import { IntlProvider } from 'react-intl';

import storiesOf from '../../../../.storybook/storiesOf';
import KeepValue from '../../../../.storybook/KeepValue';
import NormalForm from '../NormalForm';

const NormalFormWithFields = withFieldsCollection({
    childContext: true,
})(NormalForm);

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
            <IntlProvider
                locale="en"
            >
                <KeepValue
                    onChangeName="onValueChange"
                    onChange={action('onValueChange')}
                >
                    <NormalFormWithFields
                        fields={fields}
                        onSubmit={(e, value) => {
                            e.preventDefault();
                            return submitAction(value);
                        }}
                    />
                </KeepValue>
            </IntlProvider>
        </div>
    ))
    .add('with custom button', () => (
        <div>
            <IntlProvider
                locale="en"
                messages={{
                    'forms.normal.__stories__.test1': 'Custom button 1',
                }}
            >
                <KeepValue
                    onChangeName="onValueChange"
                    onChange={action('onValueChange')}
                >
                    <NormalFormWithFields
                        fields={fields}
                        buttons={[
                            {
                                label: {
                                    id: 'forms.normal.__stories__.test1',
                                    defaultMessage: 'Default test label 1',
                                },
                                className: 'btn-success',
                            },
                        ]}
                        onSubmit={(e, value) => {
                            e.preventDefault();
                            return submitAction(value);
                        }}
                    />
                </KeepValue>
            </IntlProvider>
        </div>
    ));
