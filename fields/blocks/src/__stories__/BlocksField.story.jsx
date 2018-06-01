/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import { action } from '@storybook/addon-actions';
import { IntlProvider } from 'react-intl';

import storiesOf from '../../../../.storybook/storiesOf';
import KeepValue from '../../../../.storybook/KeepValue';
import BlocksField from '../BlocksField';

storiesOf('Fields/Blocks', module)
    .add('simple', () => (
        <IntlProvider locale="en">
            <div>
                <KeepValue>
                    <BlocksField
                        label="Label"
                        helpText="This is an help text"
                        onChange={action('change')}
                    />
                </KeepValue>
            </div>
        </IntlProvider>
    ));
