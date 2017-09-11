import React from 'react';
import { action } from '@storybook/addon-actions';// eslint-disable-line import/no-extraneous-dependencies

import storiesOf from '../../../.storybook/storiesOf';
import DateField from '../DateField';
import KeepValue from '../../../.storybook/KeepValue';

storiesOf('Fields/Date', module)
    .add('simple', () => (
        <div>
            <KeepValue>
                <DateField
                    label="Label"
                    onChange={action('change')}
                />
            </KeepValue>
        </div>

    ))
    .add('range', () => (
        <div>
            <KeepValue>
                <DateField
                    label="Label"
                    type="daterange"
                    onChange={action('change')}
                />
            </KeepValue>
        </div>
    ));
