import React from 'react';
import { MemoryRouter } from 'react-router-dom'; // eslint-disable-line import/no-extraneous-dependencies

import Navbar from '../Navbar';

export default {
    component: Navbar,
    title: 'Elements/Navbar',
    parameters: {
        intl: true,
    },
};

export const Normal = () => (
    <MemoryRouter>
        <Navbar>Navbar</Navbar>
    </MemoryRouter>
);

export const DarkNav = () => (
    <MemoryRouter>
        <Navbar theme="dark" brand={<p className="m-2">My brand</p>}>
            Navbar items
        </Navbar>
    </MemoryRouter>
);
