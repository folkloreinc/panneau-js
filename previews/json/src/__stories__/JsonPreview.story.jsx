import React from 'react';
/* eslint-disable import/no-extraneous-dependencies */
import { action } from '@storybook/addon-actions';
/* eslint-enable import/no-extraneous-dependencies */
import { IntlProvider } from 'react-intl';

import storiesOf from '../../../../.storybook/storiesOf';
import JsonPreview from '../JsonPreview';

const value = {
    text: 'Text',
};

const submitAction = action('onSubmit');

storiesOf('Previews/Json', module, {
        colWidth: 12,
    })
    .add('simple', () => (
        <div>
            <IntlProvider
                locale="en"
            >
                <JsonPreview value={value} />
            </IntlProvider>
        </div>
    ));
