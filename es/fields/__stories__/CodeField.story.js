import React from 'react';
import { action } from '@storybook/addon-actions'; // eslint-disable-line import/no-extraneous-dependencies

import storiesOf from '../../../.storybook/storiesOf';
import KeepValue from '../../../.storybook/KeepValue';
import CodeField from '../CodeField';

var value = '// This is code';

var valueHtml = '<div class="a-class">\n    <img src="http://placehold.it/300x300" />\n</div>\n';

var valueJson = {
    test: 'An object'
};

storiesOf('Fields/Code', module).add('simple', function () {
    return React.createElement(
        'div',
        null,
        React.createElement(
            KeepValue,
            null,
            React.createElement(CodeField, {
                label: 'Label',
                height: 100,
                value: value,
                onChange: action('change')
            })
        ),
        React.createElement(
            KeepValue,
            null,
            React.createElement(CodeField, {
                label: 'HTML',
                language: 'html',
                height: 100,
                value: valueHtml,
                onChange: action('change')
            })
        ),
        React.createElement(
            KeepValue,
            null,
            React.createElement(CodeField, {
                label: 'JSON with Monokai theme',
                language: 'json',
                theme: 'monokai',
                height: 100,
                value: valueJson,
                isJson: true,
                onChange: action('change')
            })
        )
    );
});