import React from 'react';

import Menu from '../Menu';

export default {
    component: Menu,
    title: 'Elements/Menu',
    parameters: {
        intl: true,
    },
};

export const Normal = () => (
    <div style={{ position: 'relative' }}>
        <Menu
            items={[
                { value: 'value', label: 'Label 1' },
                { value: 'value', label: 'Label 2' },
            ]}
        />
    </div>
);

export const WithDropdown = () => (
    <div style={{ position: 'relative' }}>
        <Menu
            items={[
                { value: 'value', label: 'Label 1' },
                {
                    value: 'value',
                    label: 'Label 2',
                    dropdown: [{ value: 'value', label: 'Sub Label 1' }],
                },
            ]}
        />
    </div>
);
