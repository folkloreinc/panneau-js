import Loadable from 'react-loadable';

export default Loadable({
    loader: () => import('rc-switch'),
    loading: () => null,
});
