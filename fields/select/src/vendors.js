import Loadable from 'react-loadable';

export const AsyncCreatable = Loadable({
    loader: () => import('react-select/lib/AsyncCreatable'),
    loading: () => null,
});

export const Async = Loadable({
    loader: () => import('react-select/lib/Async'),
    loading: () => null,
});

export const Creatable = Loadable({
    loader: () => import('react-select/lib/Creatable'),
    loading: () => null,
});

export const Select = Loadable({
    loader: () => import('react-select/lib/Select'),
    loading: () => null,
});
