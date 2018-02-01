import React from 'react';
import { IntlProvider } from 'react-intl';
import { action } from '@storybook/addon-actions';// eslint-disable-line import/no-extraneous-dependencies

import storiesOf from '../../../../.storybook/storiesOf';
import KeepValue from '../../../../.storybook/KeepValue';
import Header from '../Header';

storiesOf('Layouts/Core', module)
    .add('Header', () => (
        <div>
            <IntlProvider
                locale="en"
                messages={{
                    'layouts.core.__stories__.test1': 'View all { resourceLabel }',
                }}
            >
                <Header
                    navbar={{
                        items: [
                            {
                                label: 'Items',
                                link: '#',
                                items: [
                                    {
                                        label: 'Some action',
                                        link: '#',
                                    },
                                    {
                                        type: 'divider',
                                    },
                                    {
                                        label: {
                                            id: 'layouts.core.__stories__.test1',
                                            values: {
                                                resourceLabel: 'items',
                                            },
                                        },
                                        link: '#',
                                    },
                                ],
                            },
                        ],
                    }}
                />
            </IntlProvider>
        </div>
    ));
