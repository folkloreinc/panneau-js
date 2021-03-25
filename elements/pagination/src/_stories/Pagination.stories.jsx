import React from 'react';
import { MemoryRouter } from 'react-router-dom'; // eslint-disable-line import/no-extraneous-dependencies

import PaginationElement from '../Pagination';

export default {
    component: PaginationElement,
    title: 'Elements/Pagination',
    parameters: {
        intl: true,
    },
};

export const Normal = () => (
    <MemoryRouter>
        <PaginationElement page={1} lastPage={3}>
            Pagination!
        </PaginationElement>
    </MemoryRouter>
);

export const WithPrevNext = () => (
    <MemoryRouter>
        <PaginationElement page={1} lastPage={3} withPreviousNext>
            Pagination!
        </PaginationElement>
    </MemoryRouter>
);
