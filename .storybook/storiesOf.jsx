import React from 'react';
import classNames from 'classnames';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import KeepValue from './KeepValue';

export default (name, module, opts) => {
    const options = {
        colWidth: 8,
        colOffset: null,
        ...opts,
    };
    const colWidth = options.colWidth;
    const colOffset = options.colOffset === null ? (12 - options.colWidth) / 2 : options.colOffset;
    return (
        storiesOf(name, module)
            .addDecorator((story, context) => withInfo()(story)(context))
            .addDecorator(story => (
                <div className="container" style={{ marginTop: 10 }}>
                    <div className="row justify-content-md-center">
                        <div
                            className={classNames({
                                [`col-md-${colWidth}`]: true,
                            })}
                        >
                            <KeepValue>
                                { story() }
                            </KeepValue>
                        </div>
                    </div>
                </div>
            ))
    );
};
