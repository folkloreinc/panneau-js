import React from 'react';
import { action } from '@storybook/addon-actions'; // eslint-disable-line import/no-extraneous-dependencies

import storiesOf from '../../../.storybook/storiesOf';
import ColorField from '../ColorField';
import KeepValue from '../../../.storybook/KeepValue';

storiesOf('Fields/Color', module).add('simple', function () {
    return React.createElement(
        'div',
        null,
        React.createElement(
            KeepValue,
            null,
            React.createElement(ColorField, {
                label: 'Label',
                onChange: action('change')
            })
        ),
        React.createElement(
            KeepValue,
            null,
            React.createElement(ColorField, {
                label: 'Disabled',
                value: '#FFCC00',
                disabled: true,
                onChange: action('change')
            })
        )
    );
}).add('with input', function () {
    return React.createElement(
        'div',
        null,
        React.createElement(
            KeepValue,
            null,
            React.createElement(ColorField, {
                label: 'Label',
                withInput: true,
                onChange: action('change')
            })
        )
    );
});