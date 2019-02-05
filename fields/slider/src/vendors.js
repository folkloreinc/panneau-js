import Loadable from 'react-loadable';

export const Slider = Loadable({
    loader: () => import('rc-slider/lib/Slider'),
    loading: () => null,
});

export const Range = Loadable({
    loader: () => import('rc-slider/lib/Range'),
    loading: () => null,
});
