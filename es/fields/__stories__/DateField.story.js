import React from 'react';
import { action } from '@storybook/addon-actions'; // eslint-disable-line import/no-extraneous-dependencies

import storiesOf from '../../../.storybook/storiesOf';
import DateField from '../DateField';
import KeepValue from '../../../.storybook/KeepValue';

storiesOf('Fields/Date', module).add('simple', function () {
    return React.createElement(
        'div',
        null,
        React.createElement(
            KeepValue,
            null,
            React.createElement(DateField, {
                label: 'Label',
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
            React.createElement(DateField, {
                label: 'Label',
                type: 'daterange',
                onChange: action('change')
            })
        )
    );
});