/* eslint-disable import/no-extraneous-dependencies */
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
/* eslint-enable import/no-extraneous-dependencies */

import React from 'react';
import TextField from '../TextField';

let value = '';

storiesOf('TextField', module)
    .add('simple', () => (
        <TextField
            value={value}
            onChange={(val) => {
                value = val;
                action('change');
            }}
        />
    ));
