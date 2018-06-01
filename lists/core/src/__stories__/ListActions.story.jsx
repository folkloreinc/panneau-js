import React from 'react';
/* eslint-disable import/no-extraneous-dependencies */
import { IntlProvider } from 'react-intl';
/* eslint-enable import/no-extraneous-dependencies */

import storiesOf from '../../../../.storybook/storiesOf';
import ListActions from '../ListActions';

const item = {
    id: '1',
    name: 'Test 1',
};

storiesOf('Lists/Core', module).add('simple', () => (
    <div>
        <IntlProvider locale="en">
            <div>
                <div className="form-group">
                    <h5>Normal</h5>
                    <div>
                        <ListActions item={item} />
                    </div>
                </div>

                <div className="form-group">
                    <h5>With icons</h5>
                    <div>
                        <ListActions item={item} withIcons />
                    </div>
                </div>

                <div className="form-group">
                    <h5>Without label</h5>
                    <div>
                        <ListActions item={item} withoutLabel />
                    </div>
                </div>
            </div>
        </IntlProvider>
    </div>
));
