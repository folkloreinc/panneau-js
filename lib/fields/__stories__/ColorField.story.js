import React from 'react';
import { action } from '@storybook/addon-actions'; // eslint-disable-line import/no-extraneous-dependencies

import storiesOf from '../../../.storybook/storiesOf';
import ColorField from '../ColorField';

storiesOf('ColorField', module).add('simple', function () {
    return React.createElement(ColorField, {
        label: 'Label',
        onChange: action('change')
    });
}).add('disabled', function () {
    return React.createElement(ColorField, {
        label: 'Label',
        value: '#FFCC00',
        disabled: true,
        onChange: action('change')
    });
});