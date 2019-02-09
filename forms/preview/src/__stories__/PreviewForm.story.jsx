import React from 'react';
/* eslint-disable import/no-extraneous-dependencies */
import { action } from '@storybook/addon-actions';
/* eslint-enable import/no-extraneous-dependencies */
import { IntlProvider } from 'react-intl';

import storiesOf from '../../../../.storybook/storiesOf';
import KeepValue from '../../../../.storybook/KeepValue';
import withFieldsCollection from '../../../../fields/fields/src/withFieldsCollection';
import withPreviewsCollection from '../../../../previews/previews/src/withPreviewsCollection';
import withFormsCollection from '../../../forms/src/withFormsCollection';
import PreviewForm from '../PreviewForm'; // eslint-disable-line import/no-named-as-default

const PreviewFormWithFields = withFieldsCollection({
    childContext: true,
})(PreviewForm);
const PreviewFormWithForms = withFormsCollection({
    childContext: true,
})(PreviewFormWithFields);
const PreviewFormWithPreviews = withPreviewsCollection({
    childContext: true,
})(PreviewFormWithForms);

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
            <IntlProvider locale="en">
                <KeepValue onChangeName="onChange" onChange={action('onChange')}>
                    <PreviewFormWithPreviews
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
    .add('with errors', () => (
        <IntlProvider
            locale="en"
            messages={{
                'forms.normal.__stories__.test1': 'Custom button 1',
            }}
        >
            <div>
                <KeepValue onChangeName="onChange" onChange={action('onChange')}>
                    <PreviewFormWithPreviews
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
                    <PreviewFormWithPreviews
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
    ))
    .add('with custom button and notice', () => (
        <div>
            <IntlProvider
                locale="en"
                messages={{
                    'forms.normal.__stories__.test1': 'Custom button 1',
                }}
            >
                <KeepValue onChangeName="onChange" onChange={action('onChange')}>
                    <PreviewFormWithPreviews
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
        </div>
    ));
