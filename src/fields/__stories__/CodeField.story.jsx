import React from 'react';
import { action } from '@storybook/addon-actions';// eslint-disable-line import/no-extraneous-dependencies

import storiesOf from '../../../.storybook/storiesOf';
import CodeField from '../CodeField';

storiesOf('Fields/Code', module)
    .add('simple', () => (
        <CodeField
            label="Label"
            onChange={action('change')}
        />
    ));
