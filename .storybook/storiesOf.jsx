import React from 'react';
import classNames from 'classnames';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import KeepValue from './KeepValue';

export default (name, module, opts) => {
    const options = {
        colWidth: 6,
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
                    <div className="row">
                        <div
                            className={classNames({
                                [`col-sm-${colWidth}`]: true,
                                [`col-sm-offset-${colOffset}`]: colOffset > 0,
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
