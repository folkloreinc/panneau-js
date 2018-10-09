import Loadable from 'react-loadable';

export const AsyncCreatable = Loadable({
    loader: () => import(/* webpackChunkName: "vendor/react-select/AsyncCreatable" */ 'react-select/lib/AsyncCreatable'),
    loading: () => null,
});

export const Async = Loadable({
    loader: () => import(/* webpackChunkName: "vendor/react-select/Async" */ 'react-select/lib/Async'),
    loading: () => null,
});

export const Creatable = Loadable({
    loader: () => import(/* webpackChunkName: "vendor/react-select/Creatable" */ 'react-select/lib/Creatable'),
    loading: () => null,
});

export const Select = Loadable({
    loader: () => import(/* webpackChunkName: "vendor/react-select/Select" */ 'react-select/lib/Select'),
    loading: () => null,
});
