import { useState } from 'react';
import { useArgs } from 'storybook/preview-api';

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
            {
                label: 'Menu label',
                href: '/logout',
                onClick: null,
            },
        ],
    },
];

export const Normal = {
    render: () => (
        <div style={{ position: 'relative' }}>
            <Dropdown
                visible
                items={[
                    { id: 'value1', label: 'Label 1' },
                    { id: 'value2', label: 'Label 2' },
                ]}
            />
        </div>
    ),
};

export const End = {
    render: () => (
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
    ),
};

export const WithButton = {
    args: {
        visible: false,
    },
    render: function () {
        const [{ visible }, updateArgs] = useArgs();

        function onClick() {
            updateArgs({ visible: !visible });
        }
        return (
            <div style={{ position: 'relative' }}>
                <div className="dropdown">
                    <button className="btn btn-secondary dropdown-toggle" onClick={onClick}>
                        Dropdown button
                    </button>
                    <Dropdown
                        visible={visible}
                        items={[
                            { id: 'value1', label: 'Label 1' },
                            { id: 'value', label: 'Label 2' },
                        ]}
                        className="mt-1"
                    />
                </div>
            </div>
        );
    },
};
