import React from 'react';
import { action } from '@storybook/addon-actions'; // eslint-disable-line import/no-extraneous-dependencies

import storiesOf from '../../../.storybook/storiesOf';
import SliderField from '../SliderField';
import KeepValue from '../../../.storybook/KeepValue';

storiesOf('Fields/Slider', module).add('simple', function () {
    return React.createElement(
        'div',
        null,
        React.createElement(
            KeepValue,
            null,
            React.createElement(SliderField, {
                label: 'Label',
                value: 50,
                onChange: action('change')
            })
        )
    );
}).add('range', function () {
    return React.createElement(
        'div',
        null,
        React.createElement(
            KeepValue,
            null,
            React.createElement(SliderField, {
                label: 'Label',
                value: [50, 60, 70],
                range: true,
                onChange: action('change')
            })
        )
    );
});