/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import { action } from '@storybook/addon-actions';
import { IntlProvider } from 'react-intl';

import storiesOf from '../../../../.storybook/storiesOf';
import KeepValue from '../../../../.storybook/KeepValue';
import UrlField from '../UrlField';
import UrlLocaleField from '../UrlLocaleField';

storiesOf('Fields/Url', module)
    .add('simple', () => (
        <IntlProvider locale="en">
            <div>
                <KeepValue>
                    <UrlField
                        label="Label"
                        helpText="This is an help text"
                        onChange={action('change')}
                    />
                </KeepValue>
                <KeepValue>
                    <UrlLocaleField
                        label="With locale"
                        helpText="This is an help text"
                        locales={['fr', 'en']}
                        onChange={action('change')}
                    />
                </KeepValue>
            </div>
        </IntlProvider>
    ));
