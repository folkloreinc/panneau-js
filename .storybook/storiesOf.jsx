import React from 'react';
/* eslint-disable import/no-extraneous-dependencies */
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
/* eslint-enable import/no-extraneous-dependencies */
import KeepValue from './KeepValue';

export default (name, module) => (
    storiesOf(name, module)
        .addDecorator((story, context) => withInfo()(story)(context))
        .addDecorator(story => (
            <div className="container" style={{ marginTop: 10 }}>
                <div className="row">
                    <div className="col-xs-8 col-xs-offset-2 col-sm-6 col-sm-offset-3">
                        <KeepValue>
                            { story() }
                        </KeepValue>
                    </div>
                </div>
            </div>
        ))
);
