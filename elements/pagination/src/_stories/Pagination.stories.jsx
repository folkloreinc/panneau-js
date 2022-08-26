import React from 'react';

import PaginationElement from '../Pagination';

export default {
    component: PaginationElement,
    title: 'Elements/Pagination',
    parameters: {
        intl: true,
    },
};

export const Normal = () => (
    <PaginationElement page={1} lastPage={3}>
        Pagination!
    </PaginationElement>
);

export const WithPrevNext = () => (
    <PaginationElement page={1} lastPage={3} withPreviousNext>
        Pagination!
    </PaginationElement>
);
