import { connectRouter } from 'connected-react-router';
import { createBrowserHistory } from 'history';
import layoutReducer from './LayoutReducer';
import panneauReducer from './PanneauReducer';

export const history = createBrowserHistory();

export default {
    router: connectRouter(history),
    layout: layoutReducer,
    panneau: panneauReducer,
};
