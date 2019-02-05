/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import { action } from '@storybook/addon-actions';

import storiesOf from '../../../../.storybook/storiesOf';
import KeepValue from '../../../../.storybook/KeepValue';
import ComponentPreview from '../ComponentPreview';

const value = {
    text: 'Text',
};

storiesOf('Previews/Component', module)
    .add('simple', () => (
        <div>
            <ComponentPreview value={value}>
                {({ value }) => JSON.stringify(value)}
            </ComponentPreview>
        </div>
    ))
    .add('with valueToProps', () => (
        <div>
            <h4>With function</h4>
            <ComponentPreview value={value} valueToProps={({ text = '' }) => ({ text })}>
                {({ text }) => text}
            </ComponentPreview>

            <hr />

            <h4>With object</h4>
            <ComponentPreview value={value} valueToProps={{ text: 'text' }}>
                {({ text }) => text}
            </ComponentPreview>
        </div>
    ))
    .add('with Component', () => (
        <div>
            <ComponentPreview
                value={value}
                valueToProps={({ text = '' }) => ({ children: text })}
                Component="h1"
            />
        </div>
    ))
    .add('without reset', () => (
        <div>
            <ComponentPreview
                value={value}
                Component="h1"
                valueToProps={({ text = '' }) => ({ children: text })}
                withoutReset
            />
        </div>
    ));
