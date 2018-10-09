import Loadable from 'react-loadable';

export const Slider = Loadable({
    loader: () => import(/* webpackChunkName: "vendor/rc-slider/Slider" */ 'rc-slider/lib/Slider'),
    loading: () => null,
});

export const Range = Loadable({
    loader: () => import(/* webpackChunkName: "vendor/rc-slider/Range" */ 'rc-slider/lib/Range'),
    loading: () => null,
});
