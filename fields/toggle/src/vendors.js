import Loadable from 'react-loadable';

export default Loadable({
    loader: () => import(/* webpackChunkName: "vendor/rc-switch" */ 'rc-switch'),
    loading: () => null,
});
