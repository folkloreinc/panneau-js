import React from 'react';
import { action } from '@storybook/addon-actions'; // eslint-disable-line import/no-extraneous-dependencies

import storiesOf from '../../../.storybook/storiesOf';
import SelectField from '../SelectField';
import KeepValue from '../../../.storybook/KeepValue';

var options = [{
    value: 1,
    label: 'Option 1'
}, {
    value: 2,
    label: 'Option 2'
}, {
    value: 3,
    label: 'Option 3'
}];

storiesOf('Fields/Select', module).add('simple', function () {
    return React.createElement(
        'div',
        null,
        React.createElement(
            KeepValue,
            null,
            React.createElement(SelectField, {
                label: 'Label',
                options: options,
                value: 3,
                onChange: action('change')
            })
        ),
        React.createElement(
            KeepValue,
            null,
            React.createElement(SelectField, {
                label: 'Not clearable',
                options: options,
                clearable: false,
                addEmptyOption: true,
                value: 2,
                onChange: action('change')
            })
        ),
        React.createElement(
            KeepValue,
            null,
            React.createElement(SelectField, {
                label: 'Cannot be empty',
                options: options,
                canBeEmpty: false,
                onChange: action('change')
            })
        )
    );
}).add('multiple', function () {
    return React.createElement(
        'div',
        null,
        React.createElement(
            KeepValue,
            null,
            React.createElement(SelectField, {
                label: 'Multiple',
                options: options,
                multiple: true,
                onChange: action('change')
            })
        ),
        React.createElement(
            KeepValue,
            null,
            React.createElement(SelectField, {
                label: 'Multiple and creatable',
                options: options,
                multiple: true,
                creatable: true,
                onChange: action('change')
            })
        )
    );
});