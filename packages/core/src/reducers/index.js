import { routerReducer } from 'react-router-redux';
import layoutReducer from './LayoutReducer';
import panneauReducer from './PanneauReducer';

export default {
    routing: routerReducer,
    layout: layoutReducer,
    panneau: panneauReducer,
};
