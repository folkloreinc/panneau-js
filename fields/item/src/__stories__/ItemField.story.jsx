/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import { action } from '@storybook/addon-actions';
import { IntlProvider } from 'react-intl';

import storiesOf from '../../../../.storybook/storiesOf';
import KeepValue from '../../../../.storybook/KeepValue';
import ItemField from '../ItemField';

const suggestions = [
    {
        name: 'Item 1',
        thumbnail: 'https://picsum.photos/100/50',
        details: {
            Size: '0kb',
        },
    },
    {
        name: 'Item 2',
        thumbnail: 'https://picsum.photos/400/400',
        details: {
            Size: '0kb',
        },
    },
];

storiesOf('Fields/Item', module)
    .add('simple', () => (
        <IntlProvider locale="en">
            <div>
                <KeepValue>
                    <ItemField
                        label="Label"
                        placeholder="Search..."
                        suggestions={suggestions}
                        helpText="This is an help text"
                        onChange={action('change')}
                    />
                </KeepValue>
                <KeepValue>
                    <ItemField
                        label="With an item"
                        placeholder="Search..."
                        suggestions={suggestions}
                        value={suggestions[0]}
                        helpText="This is an help text"
                        onChange={action('change')}
                    />
                </KeepValue>
            </div>
        </IntlProvider>
    ))
    .add('vertical', () => (
        <IntlProvider locale="en">
            <div>
                <KeepValue>
                    <ItemField
                        label="With an item"
                        placeholder="Search..."
                        suggestions={suggestions}
                        value={suggestions[1]}
                        cardVertical
                        helpText="This is an help text"
                        onChange={action('change')}
                    />
                </KeepValue>
                <KeepValue>
                    <ItemField
                        label="With background cover"
                        placeholder="Search..."
                        suggestions={suggestions}
                        value={suggestions[1]}
                        cardVertical
                        cardProps={{
                            thumbnailSize: 'cover',
                        }}
                        helpText="This is an help text"
                        onChange={action('change')}
                    />
                </KeepValue>
            </div>
        </IntlProvider>
    ));
