import { createStore, applyMiddleware, combineReducers } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import promise from 'redux-promise';

export default (reducers, initialState, middlewares, opts) => {
    const options = {
        devTools: {},
        ...opts,
    };
    const reducer = combineReducers(reducers);
    const composeEnhancers = composeWithDevTools(options.devTools);
    const enhancer = composeEnhancers(applyMiddleware(...middlewares, thunk, promise));
    return createStore(reducer, initialState, enhancer);
};
