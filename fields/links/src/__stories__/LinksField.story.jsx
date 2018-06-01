/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import { action } from '@storybook/addon-actions';
import { IntlProvider } from 'react-intl';

import storiesOf from '../../../../.storybook/storiesOf';
import KeepValue from '../../../../.storybook/KeepValue';
import LinkField from '../LinkField';
import LinkLocaleField from '../LinkLocaleField';
import LinksField from '../LinksField';
import LinksLocaleField from '../LinksLocaleField';

storiesOf('Fields/Links', module)
    .add('simple', () => (
        <IntlProvider locale="en">
            <div>
                <KeepValue>
                    <LinkField
                        label="Label"
                        helpText="This is an help text"
                        onChange={action('change')}
                    />
                </KeepValue>
                <KeepValue>
                    <LinkLocaleField
                        label="With locale"
                        helpText="This is an help text"
                        locales={['fr', 'en']}
                        onChange={action('change')}
                    />
                </KeepValue>
            </div>
        </IntlProvider>
    ))
    .add('multiple', () => (
        <IntlProvider locale="en">
            <div>
                <KeepValue>
                    <LinksField
                        label="Label"
                        helpText="This is an help text"
                        onChange={action('change')}
                    />
                </KeepValue>
                <KeepValue>
                    <LinksLocaleField
                        label="With locale"
                        helpText="This is an help text"
                        locales={['fr', 'en']}
                        onChange={action('change')}
                    />
                </KeepValue>
            </div>
        </IntlProvider>
    ));
