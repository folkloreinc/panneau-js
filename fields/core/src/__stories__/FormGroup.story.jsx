import React from 'react';
import { action } from '@storybook/addon-actions';// eslint-disable-line import/no-extraneous-dependencies

import storiesOf from '../../../../.storybook/storiesOf';
import FormGroup from '../FormGroup';

storiesOf('Fields/Core/FormGroup', module)
    .add('simple', () => (
        <div>
            <FormGroup label="A label" helpText="Help text">
                <input type="text" className="form-control" />
            </FormGroup>
        </div>
    ))
    .add('with error', () => (
        <div>
            <FormGroup label="A label" helpText="Help text" errors={['An error.']}>
                <input type="text" className="form-control" />
            </FormGroup>
        </div>
    ));
