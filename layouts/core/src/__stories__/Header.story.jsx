import React from 'react';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router';// eslint-disable-line import/no-extraneous-dependencies
import { action } from '@storybook/addon-actions';// eslint-disable-line import/no-extraneous-dependencies

import storiesOf from '../../../../.storybook/storiesOf';
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
                <MemoryRouter>
                    <Header
                        navbar={{
                            items: [
                                {
                                    label: 'Items',
                                    href: '#',
                                    external: true,
                                    items: [
                                        {
                                            label: 'Some action',
                                            href: '#',
                                            external: true,
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
                                            href: '#',
                                            external: true,
                                        },
                                    ],
                                },
                            ],
                        }}
                    />
                </MemoryRouter>
            </IntlProvider>
        </div>
    ));
