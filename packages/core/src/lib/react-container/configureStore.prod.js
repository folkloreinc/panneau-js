import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import promise from 'redux-promise';

export default (reducers, initialState, middlewares) => {
    const reducer = combineReducers(reducers);
    const enhancer = applyMiddleware(...middlewares, thunk, promise);
    return createStore(reducer, initialState, enhancer);
};
