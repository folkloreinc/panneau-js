import React from 'react';
import { action } from '@storybook/addon-actions'; // eslint-disable-line import/no-extraneous-dependencies

import storiesOf from '../../../.storybook/storiesOf';
import TextField from '../TextField';
import KeepValue from '../../../.storybook/KeepValue';

storiesOf('Fields/Text', module).add('simple', function () {
    return React.createElement(
        'div',
        null,
        React.createElement(
            KeepValue,
            null,
            React.createElement(TextField, {
                label: 'Label',
                helpText: 'This is an help text',
                placeholder: 'This is a placeholder...',
                onChange: action('change')
            })
        ),
        React.createElement(
            KeepValue,
            null,
            React.createElement(TextField, {
                label: 'Disabled',
                disabled: true,
                onChange: action('change')
            })
        )
    );
}).add('with suffix and prefix', function () {
    return React.createElement(TextField, {
        label: 'Label',
        helpText: 'This is an help text',
        placeholder: '0.00',
        prefix: 'Total',
        suffix: '$',
        align: 'right',
        onChange: action('change')
    });
}).add('other field types', function () {
    return React.createElement(
        'div',
        null,
        React.createElement(
            KeepValue,
            null,
            React.createElement(TextField, {
                label: 'Textarea',
                type: 'textarea',
                onChange: action('change')
            })
        ),
        React.createElement(
            'form',
            null,
            React.createElement(
                KeepValue,
                null,
                React.createElement(TextField, {
                    label: 'Editor',
                    type: 'editor',
                    onChange: action('change')
                })
            )
        )
    );
});