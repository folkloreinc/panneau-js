import React from 'react';
import { action } from '@storybook/addon-actions';// eslint-disable-line import/no-extraneous-dependencies

import storiesOf from '../../../../.storybook/storiesOf';
import KeepValue from '../../../../.storybook/KeepValue';
import CodeField from '../CodeField';

const value = '// This is code';

const valueHtml = `<div class="a-class">
    <img src="http://placehold.it/300x300" />
</div>
`;

const valueJson = {
    test: 'An object',
};

storiesOf('Fields/Code', module)
    .add('simple', () => (
        <div>
            <KeepValue>
                <CodeField
                    label="Label"
                    height={100}
                    value={value}
                    onChange={action('change')}
                />
            </KeepValue>
            <KeepValue>
                <CodeField
                    label="HTML"
                    language="html"
                    height={100}
                    value={valueHtml}
                    onChange={action('change')}
                />
            </KeepValue>
            <KeepValue>
                <CodeField
                    label="JSON with Monokai theme"
                    language="json"
                    theme="monokai"
                    height={100}
                    value={valueJson}
                    isJson
                    onChange={action('change')}
                />
            </KeepValue>
        </div>
    ));
