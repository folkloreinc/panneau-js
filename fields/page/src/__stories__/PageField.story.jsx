/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import { action } from '@storybook/addon-actions';
import { IntlProvider } from 'react-intl';

import storiesOf from '../../../../.storybook/storiesOf';
import KeepValue from '../../../../.storybook/KeepValue';
import PageField from '../PageField';

storiesOf('Fields/Page', module)
    .add('simple', () => (
        <IntlProvider locale="en">
            <div>
                <KeepValue>
                    <PageField
                        label="Label"
                        helpText="This is an help text"
                        endpoint="/api/pages"
                        onChange={action('change')}
                    />
                </KeepValue>
            </div>
        </IntlProvider>
    ));
