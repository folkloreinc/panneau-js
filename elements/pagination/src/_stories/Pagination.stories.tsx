import PaginationElement from '../Pagination';

export default {
    component: PaginationElement,
    title: 'Elements/Pagination',
    parameters: {
        intl: true,
    },
};

export const Normal = {
    render: () => (
        <PaginationElement page={1} lastPage={3}>
            Pagination!
        </PaginationElement>
    ),
};

export const WithPrevNext = {
    render: () => (
        <PaginationElement page={1} lastPage={3} withPreviousNext>
            Pagination!
        </PaginationElement>
    ),
};

export const LoadingLeft = {
    render: () => (
        <PaginationElement page={1} lastPage={3} withPreviousNext loading align="left">
            Pagination!
        </PaginationElement>
    ),
};
