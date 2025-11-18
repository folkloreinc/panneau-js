import React from 'react';

import Badges from '../Badges';

export default {
    component: Badges,
    title: 'Displays/Badges',
    parameters: {
        intl: true,
    },
};

export const Normal = {
    render: () => (

    <Badges
        value={[
            { label: 'Hello!', value: 'hello' },
            { label: 'Goodbye!', value: 'goodbye' },
        ]}
        itemLabelPath="label"
    />

    ),
};

export const Custom = {
    render: () => (

    <Badges
        value={[
            {
                value: 'hello',
                icon: 'archive',
                labelzz: { custom: 'Hello....', class: 'bg-info' },
            },
            { labelzz: { custom: 'Goodbye....', class: 'bg-danger' }, value: 'goodbye' },
        ]}
        itemLabelPath="labelzz.custom"
        itemClassName="bg-secondary"
        itemClassNamePath="labelzz.class"
        itemIconPath="icon"
    />

    ),
};

export const Empty = {
    render: () => <Badges value={null} itemLabelPath="null" />,
};