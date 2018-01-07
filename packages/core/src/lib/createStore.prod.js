import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import promise from 'redux-promise';

import reducers from '../reducers/index';

export default (initialState, middlewares) => {
    const reducer = combineReducers(reducers);
    const enhancer = applyMiddleware(...middlewares, thunk, promise);
    return createStore(reducer, initialState, enhancer);
};
