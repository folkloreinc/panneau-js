import React from 'react';
import { action } from '@storybook/addon-actions';// eslint-disable-line import/no-extraneous-dependencies
import { IntlProvider } from 'react-intl';

import storiesOf from '../../../../.storybook/storiesOf';
import KeepValue from '../../../../.storybook/KeepValue';
import ColorField from '../ColorField';

storiesOf('Fields/Color', module)
    .add('simple', () => (
        <IntlProvider locale="en">
            <div>
                <KeepValue>
                    <ColorField
                        label="Label"
                        onChange={action('change')}
                    />
                </KeepValue>
                <KeepValue>
                    <ColorField
                        label="Disabled"
                        value="#FFCC00"
                        disabled
                        onChange={action('change')}
                    />
                </KeepValue>
            </div>
        </IntlProvider>
    ))
    .add('with input', () => (
        <IntlProvider locale="en">
            <div>
                <KeepValue>
                    <ColorField
                        label="Label"
                        withInput
                        onChange={action('change')}
                    />
                </KeepValue>
            </div>
        </IntlProvider>
    ));
