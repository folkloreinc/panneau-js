import React from 'react';
import { MemoryRouter } from 'react-router-dom'; // eslint-disable-line import/no-extraneous-dependencies

import Menu from '../Menu';

export default {
    component: Menu,
    title: 'Elements/Menu',
    parameters: {
        intl: true,
    },
};

export const Normal = () => (
    <MemoryRouter>
        <div style={{ position: 'relative' }}>
            <Menu
                items={[
                    { value: 'value', label: 'Label 1' },
                    { value: 'value', label: 'Label 2' },
                ]}
            />
        </div>
    </MemoryRouter>
);
