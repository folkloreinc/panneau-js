import React from 'react';
import { action } from '@storybook/addon-actions';// eslint-disable-line import/no-extraneous-dependencies
import { withFieldsCollection } from '@panneau/fields';

import storiesOf from '../../../../.storybook/storiesOf';
import KeepValue from '../../../../.storybook/KeepValue';
import NormalForm from '../NormalForm';

const NormalFormWithFields = withFieldsCollection()(NormalForm);

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
        </div>
    ));
