import React from 'react';
import { action } from '@storybook/addon-actions';// eslint-disable-line import/no-extraneous-dependencies

import storiesOf from '../../../.storybook/storiesOf';
import ColorField from '../ColorField';

storiesOf('ColorField', module)
    .add('simple', () => (
        <ColorField
            label="Label"
            onChange={action('change')}
        />
    ))
    .add('disabled', () => (
        <ColorField
            label="Label"
            value="#FFCC00"
            disabled
            onChange={action('change')}
        />
    ));
