import React from 'react';
import { action } from '@storybook/addon-actions';// eslint-disable-line import/no-extraneous-dependencies

import storiesOf from '../../../.storybook/storiesOf';
import TextField from '../TextField';

storiesOf('TextField', module)
    .add('simple', () => (
        <TextField
            label="Label"
            helpText="This is an help text"
            placeholder="This is a placeholder..."
            onChange={action('change')}
        />
    ))
    .add('with suffix and prefix', () => (
        <TextField
            label="Label"
            helpText="This is an help text"
            placeholder="0.00"
            prefix="Total"
            suffix="$"
            align="right"
            onChange={action('change')}
        />
    ));
