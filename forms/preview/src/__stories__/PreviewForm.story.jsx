import React from 'react';
/* eslint-disable import/no-extraneous-dependencies */
import { action } from '@storybook/addon-actions';
import { withFieldsCollection } from '@panneau/fields';
import { withPreviewsCollection } from '@panneau/previews';
/* eslint-enable import/no-extraneous-dependencies */
import { IntlProvider } from 'react-intl';

import storiesOf from '../../../../.storybook/storiesOf';
import KeepValue from '../../../../.storybook/KeepValue';
import PreviewForm from '../PreviewForm';

const PreviewFormWithFields = withFieldsCollection({
    childContext: true,
})(PreviewForm);

const PreviewFormWithPreviews = withPreviewsCollection({
    childContext: true,
})(PreviewFormWithFields);

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
            <IntlProvider
                locale="en"
            >
                <KeepValue
                    onChangeName="onValueChange"
                    onChange={action('onValueChange')}
                >
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
                    <PreviewFormWithPreviews
                        generalError="A general error"
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
            </IntlProvider>
        </div>
    ))
    .add('with custom button and notice', () => (
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
                    <PreviewFormWithPreviews
                        fields={fields}
                        buttons={[
                            {
                                label: 'Default test label 1',
                                className: 'btn-success',
                            },
                        ]}
                        notice={(
                            <span
                                className="text-info"
                            >
                                <span
                                    className="glyphicon glyphicon-info-sign"
                                    style={{ marginRight: '4px' }}
                                />
                                This is a notice.
                            </span>
                        )}
                        onSubmit={(e, value) => {
                            e.preventDefault();
                            return submitAction(value);
                        }}
                    />
                </KeepValue>
            </IntlProvider>
        </div>
    ));
