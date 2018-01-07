import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import promise from 'redux-promise';
import { persistState } from 'redux-devtools';

import DevTools from '../components/DevTools';
import reducers from '../reducers/index';

export default (initialState, middlewares) => {
    const reducer = combineReducers(reducers);
    const sessionId = typeof window !== 'undefined' ? window.location.href.match(/[?&]debug_session=([^&#]+)\b/) : null;
    const enhancer = compose(
        applyMiddleware(...middlewares, thunk, promise),
        DevTools.instrument(),
        persistState(sessionId),
    );
    return createStore(reducer, initialState, enhancer);
};
