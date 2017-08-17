import React from 'react';
/* eslint-disable import/no-extraneous-dependencies */
import { action } from '@storybook/addon-actions';
/* eslint-enable import/no-extraneous-dependencies */
import storiesOf from '../../../.storybook/storiesOf';
import TextField from '../TextField';

storiesOf('TextField', module)
    .add('simple', () => (
        <TextField
            onChange={action('change')}
        />
    ))
    .add('with label', () => (
        <TextField
            label="Label"
            helpText="This is an help text"
            onChange={action('change')}
        />
    ))
    .add('with suffix and prefix', () => (
        <TextField
            label="Label"
            prefix="Money"
            suffix="$"
            onChange={action('change')}
        />
    ));
