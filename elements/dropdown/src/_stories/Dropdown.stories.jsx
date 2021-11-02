import React, { useState } from 'react';
import { MemoryRouter } from 'react-router-dom'; // eslint-disable-line import/no-extraneous-dependencies
import Menu from '../../../menu/src/Menu';
import Select from '../../../select/src/Select';
import Dropdown from '../Dropdown';

export default {
    component: Dropdown,
    title: 'Elements/Dropdown',
    parameters: {
        intl: true,
    },
};

const items = [
    {
        id: 'account',
        label: 'label',
        href: 'https://www.google.com',
        dropdown: [
            //   {
            //       label: (
            //           <FormattedMessage
            //               defaultMessage="Update account"
            //               description="Menu label"
            //           />
            //       ),
            //       href: route('panneau.account'),
            //   },
            {
                label: 'Menu label',
                href: '/logout',
                onClick: null,
            },
        ],
    },
];

export const Normal = () => (
    <MemoryRouter>
        <div style={{ position: 'relative' }}>
            <Dropdown
                visible
                items={[
                    { id: 'value1', label: 'Label 1' },
                    { id: 'value2', label: 'Label 2' },
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
                    { id: 'value1', label: 'Label 1' },
                    { id: 'value', label: 'Label 2' },
                ]}
            />
        </div>
    </MemoryRouter>
);

export const WithClickOutside = () => {
    const [value, setValue] = useState(null);
    return (
        <MemoryRouter>
            <div style={{ position: 'relative' }}>
                <Menu items={items} />
                <Select
                    onChange={setValue}
                    value={value}
                    options={[
                        { value: 'value1', label: 'Label 1' },
                        { value: 'value', label: 'Label 2' },
                    ]}
                />
            </div>
        </MemoryRouter>
    );
};
