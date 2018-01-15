import React from 'react';
import { action } from '@storybook/addon-actions';// eslint-disable-line import/no-extraneous-dependencies

import storiesOf from '../../../../.storybook/storiesOf';
import NormalForm from '../NormalForm';

const fields = [

];

storiesOf('Forms/Normal', module)
    .add('simple', () => (
        <div>
            <NormalForm
                fields={fields}
            />
        </div>
    ));
