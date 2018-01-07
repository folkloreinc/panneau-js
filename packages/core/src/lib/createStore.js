import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import promise from 'redux-promise';
import reducers from '../reducers/index';

let persistState;
let DevTools;
if (__DEV__) {
    /* eslint-disable global-require, prefer-destructuring */
    persistState = require('redux-devtools').persistState;
    DevTools = require('../components/DevTools').default;
    /* eslint-enable global-require */
}

export default (initialState, middlewares) => {
    const reducer = combineReducers(reducers);
    const sessionId = __DEV__ && typeof window !== 'undefined' ? window.location.href.match(/[?&]debug_session=([^&#]+)\b/) : null;
    const devMiddlewares = __DEV__ ? [
        DevTools.instrument(),
        persistState(sessionId),
    ] : [];
    const enhancer = compose(
        applyMiddleware(...(middlewares || []), thunk, promise),
        ...devMiddlewares,
    );
    return createStore(reducer, initialState || {}, enhancer);
};
