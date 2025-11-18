import React from 'react';

import Navbar from '../Navbar';

export default {
    component: Navbar,
    title: 'Elements/Navbar',
    parameters: {
        intl: true,
    },
};

export const Normal = {
    render: () => <Navbar>Navbar</Navbar>,
};

export const DarkNav = {
    render: () => (

    <Navbar theme="dark" brand={<p className="m-2">My brand</p>}>
        Navbar items
    </Navbar>

    ),
};