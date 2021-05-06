import React from 'react';
import { MemoryRouter } from 'react-router-dom'; // eslint-disable-line import/no-extraneous-dependencies

import Dropdown from '../Dropdown';

export default {
    component: Dropdown,
    title: 'Elements/Dropdown',
    parameters: {
        intl: true,
    },
};

export const Normal = () => (
    <MemoryRouter>
        <div style={{ position: 'relative' }}>
            <Dropdown
                visible
                items={[
                    { value: 'value', label: 'Label 1' },
                    { value: 'value', label: 'Label 2' },
                ]}
            />
        </div>
    </MemoryRouter>
);

export const End = () => (
    <MemoryRouter>
        <div style={{ position: 'relative' }}>
            <Dropdown
                visible
                align="end"
                items={[
                    { value: 'value', label: 'Label 1' },
                    { value: 'value', label: 'Label 2' },
                ]}
            />
        </div>
    </MemoryRouter>
);
