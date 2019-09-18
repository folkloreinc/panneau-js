import Loadable from 'react-loadable';

export const AsyncCreatable = Loadable({
    loader: () => import('react-select/async-creatable'),
    loading: () => null,
});

export const Async = Loadable({
    loader: () => import('react-select/async'),
    loading: () => null,
});

export const Creatable = Loadable({
    loader: () => import('react-select/creatable'),
    loading: () => null,
});

export const Select = Loadable({
    loader: () => import('react-select'),
    loading: () => null,
});
