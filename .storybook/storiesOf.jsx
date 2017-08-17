import React from 'react';
/* eslint-disable import/no-extraneous-dependencies */
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
/* eslint-enable import/no-extraneous-dependencies */
import StateField from './StateField';

export default (name, module) => (
    storiesOf(name, module)
        .addDecorator(story => (
            <StateField>
                { story() }
            </StateField>
        ))
        .addDecorator((story, context) => withInfo()(story)(context))
        .addDecorator(story => (
            <div className="container" style={{ marginTop: 10 }}>
                <div className="row">
                    <div className="col-sm-6 col-sm-offset-3">
                        { story() }
                    </div>
                </div>
            </div>
        ))
);
